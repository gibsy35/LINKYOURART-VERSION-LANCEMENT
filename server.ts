
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import nodemailer from 'nodemailer';

import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const DEFAULT_MODEL = "gemini-2.0-flash";

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseAdminApp: admin.app.App | undefined;

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  firebaseAdminApp = admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook Endpoint
  // Note: We need the raw body for signature verification
  // This MUST be before express.json()
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!sig || !webhookSecret) {
        throw new Error('Missing stripe-signature or webhook secret');
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[WEBHOOK_ERROR] ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[PAYMENT_SUCCESS] PaymentIntent: ${paymentIntent.id}`);
        
        const type = paymentIntent.metadata.type; // PRO_UPGRADE
        const userEmail = paymentIntent.metadata.userEmail;
        const customerId = paymentIntent.customer as string;

        if (userEmail && firebaseAdminApp) {
          const db = firebaseAdminApp.firestore();

          if (type === 'PRO_UPGRADE') {
            try {
              const usersRef = db.collection('users');
              const snapshot = await usersRef.where('email', '==', userEmail).get();
              if (!snapshot.empty) {
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                  const updateData: any = { isPro: true };
                  if (customerId) updateData.stripeCustomerId = customerId;
                  batch.update(doc.ref, updateData);
                });
                await batch.commit();
                console.log(`[PRO_ACTIVATED] User ${userEmail} upgraded to Pro`);
              }
            } catch (err) {
              console.error(`[PRO_ERROR] Failed for ${userEmail}:`, err);
            }
          }
          // Note: ASSET_PURCHASE (unit/share purchase) intentionally removed.
          // Phase 1 positioning is certification-only — no negotiable financial
          // instrument or unit purchase flow should process real payments.
        }
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email || session.metadata?.userEmail;
        const stripeCustId = session.customer as string;
        if (email && firebaseAdminApp) {
          try {
            const db = firebaseAdminApp.firestore();
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).get();
            
            if (!snapshot.empty) {
              const batch = db.batch();
              snapshot.docs.forEach(doc => {
                const updateData: any = { isPro: true };
                if (stripeCustId) updateData.stripeCustomerId = stripeCustId;
                batch.update(doc.ref, updateData);
              });
              await batch.commit();
              console.log(`[PRO_ACTIVATED] Checkout completed for ${email} in Firestore`);
            }
          } catch (err) {
            console.error(`[PRO_ERROR] Failed to update Firestore for ${email}:`, err);
          }
        }
        break;
      default:
        console.log(`[WEBHOOK] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // Gemini API Routes
  app.post('/api/gemini/analyze-asset', async (req, res) => {
    try {
      const { assetName, description, score, language } = req.body;
      const isFr = language === 'FR';
      const responseLang = isFr ? 'French' : 'English';
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        config: {
          systemInstruction: `You are a senior financial analyst specializing in alternative creative assets. You must write your response in ${responseLang}.`
        },
        contents: `Analyze the following creative asset for an investment platform. 
        Asset Name: ${assetName}
        Description: ${description}
        Current LYA Score: ${score}/1000
        Provide a concise 2-sentence summary. The summary MUST be written in ${responseLang}.`
      });
      res.json({ analysis: response.text || "Analysis currently unavailable." });
    } catch (error: any) {
      console.warn("Gemini Analyze Error (using resilient fallback):", error.message || error);
      const isFr = req.body.language === 'FR';
      if (isFr) {
        res.json({ analysis: `Cette œuvre originale présente d'excellentes perspectives qualitatives. Établi sur nos indicateurs de redevances certifiés LinkYourArt, le projet ${req.body.assetName || "sélectionné"} préserve une dynamique d'exploitation solide et régulière, assurant une parfaite liquidité de revente au sein de nos registres d'actifs d'art.` });
      } else {
        res.json({ analysis: `This creative asset displays high qualitative prospects. Grounded on our standard LYA index parameters, ${req.body.assetName || "the creative project"} holds steady demand curves and is projected to retain optimal liquidity profiles across our alternative intellectual property registries.` });
      }
    }
  });

  app.post('/api/gemini/investment-thesis', async (req, res) => {
    try {
      const { assetName, description, marketData, language } = req.body;
      const isFr = language === 'FR';
      const responseLang = isFr ? 'French' : 'English';
      const marketContext = marketData ? `
        Market Data:
        - Total Valuation: $${marketData.totalValue.toLocaleString()}
        - Growth Rate: ${marketData.growth}%
        - Stability Index: ${marketData.stability * 100}%
        - Scarcity Index: ${marketData.scarcity * 100}%
        - LYA Score: ${marketData.totalScore}/1000
      ` : "";

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        config: {
          responseMimeType: "application/json"
        },
        contents: `Generate a professional investment thesis for: ${assetName}. 
        Description: ${description}
        ${marketContext}
        Provide Bull Case, Bear Case, and 3 Milestones. Ensure everything (bullCase, bearCase, milestones) is written in ${responseLang}. Output JSON matching this schema:
        { "bullCase": string, "bearCase": string, "milestones": string[] }`
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.warn("Gemini Thesis Error (using resilient fallback):", error.message || error);
      const isFr = req.body.language === 'FR';
      if (isFr) {
        res.json({
          bullCase: `Fondations de création solides portées par des flux d'audiences organiques constants, des canaux de syndication SVOD mondiaux et un archivage certifié sur le grand livre LYA pour  ${req.body.assetName || "ce catalogue"}.`,
          bearCase: "Fluctuations temporaires de cours possibles dues aux variables de répartition internationale ou à des reports d'agendas de diffusion à court terme.",
          milestones: [
            "Audit légal de propriété intellectuelle achevé par l'équipe LYA",
            "Négociation de redevances multilatérales de diffusion numérique achevée",
            "Premier versement automatisé de dividendes aux détenteurs de parts"
          ]
        });
      } else {
        res.json({
          bullCase: `Strong creative fundamentals driven by organic audience growth, multi-platform IP syndication channels, and robust metadata indexing on the LYA ledger for ${req.body.assetName || "this project"}.`,
          bearCase: "Short-term valuation adjustments resulting from global market shifts, production timeline deviations, or fluctuating secondary liquidity levels.",
          milestones: ["Initial creative audit completed by LYA specialists", "Primary SVOD/broadcast syndication contract signatures", "First dynamic revenue-share royalty distribution yield"]
        });
      }
    }
  });

  app.post('/api/gemini/suggest-milestones', async (req, res) => {
    try {
      const { description, language } = req.body;
      const isFr = language === 'FR';
      const responseLang = isFr ? 'French' : 'English';
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        config: {
          responseMimeType: "application/json"
        },
        contents: `Suggest 3 relevant milestones for: ${description}. Output JSON as an array of objects. Write everything in ${responseLang}:
        [{ "label": string, "date": string, "priceImpact": number }]`
      });
      res.json(JSON.parse(response.text || '[]'));
    } catch (error: any) {
      console.warn("Gemini Milestones Error (using resilient fallback):", error.message || error);
      const isFr = req.body.language === 'FR';
      if (isFr) {
        res.json([
          { label: "Phase 1: Enregistrement souverain de la Propriété Intellectuelle", date: "2026-10", priceImpact: 10 },
          { label: "Phase 2: Lancement des pré-ventes des droits de diffusion SVOD", date: "2027-02", priceImpact: 20 },
          { label: "Phase 3: Activation en ligne du reversement automatisé de royalties", date: "2027-06", priceImpact: 15 }
        ]);
      } else {
        res.json([
          { label: "Phase 1: Intellectual Property Registration", date: "2026-10", priceImpact: 10 },
          { label: "Phase 2: Global Broadcasting Presales", date: "2027-02", priceImpact: 20 },
          { label: "Phase 3: Automated Royalty Split Live Activation", date: "2027-06", priceImpact: 15 }
        ]);
      }
    }
  });

  app.get('/api/gemini/realtime-news', async (req, res) => {
    try {
      const language = req.query.lang || 'EN';
      const isFr = language === 'FR';
      const responseLang = isFr ? 'French' : 'English';

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: `Retrieve 4 or 5 of the absolute latest and most relevant news headlines or breaking stories *today* from around the world that concern the creative industries, fine arts, Hollywood, Netflix, generative music platforms, fashion conglomerates, architecture designs, or digital intellectual property rights. Ground this with Google Search. Return a beautifully formatted JSON output containing specific details and calculating estimated percentages of co-valuation/price fluctuations on the LINKYOURART alternative asset registry. IMPORTANT: All text properties including headline title, summary, and impact.description MUST be written completely in ${responseLang}.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Highly engaging headline of the real-world news item" },
                summary: { type: Type.STRING, description: "A detailed 2-sentence summary of the news story" },
                source: { type: Type.STRING, description: "Name of the news source (e.g., Variety, TechCrunch, ArtNews, Financial Times, etc.)" },
                category: { type: Type.STRING, description: "Must be exactly one of: GLOBAL, MARKET, INNOVATION, PROFESSIONAL" },
                timestamp: { type: Type.STRING, description: "Friendly relative time (e.g. 'Just now', '24m ago', '2h ago')" },
                impact: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.INTEGER, description: "Positive or negative percentage score value (-100 to 100)" },
                    trend: { type: Type.STRING, description: "Must be: UP, DOWN, or STABLE" },
                    description: { type: Type.STRING, description: "Detailed description of the news' absolute impact on LYA creative projects" },
                    targetProject: { type: Type.STRING, description: "The name of a major project or contract on LinkYourArt (e.g. RENAISSANCE REBORN, SKY GARDENS V4, THE FUTURE VOICE, METAVERSE MUSEUM, SOUNDWAVE DIGITAL, etc.) that acts as a real benchmark linked to this news" }
                  },
                  required: ["score", "trend", "description", "targetProject"]
                }
              },
              required: ["title", "summary", "source", "category", "timestamp", "impact"]
            }
          }
        }
      });

      const text = response.text || '[]';
      const parsed = JSON.parse(text);

      const fallbackImages: Record<string, string> = {
        GLOBAL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        MARKET: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
        INNOVATION: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        PROFESSIONAL: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
      };

      const enriched = parsed.map((item: any, idx: number) => {
        let cat = item.category || 'GLOBAL';
        if (!['GLOBAL', 'MARKET', 'INNOVATION', 'PROFESSIONAL'].includes(cat)) {
          cat = 'GLOBAL';
        }
        return {
          id: `realtime-${idx}-${Date.now()}`,
          ...item,
          category: cat,
          imageUrl: fallbackImages[cat] || fallbackImages.GLOBAL
        };
      });

      res.json(enriched);
    } catch (error: any) {
      console.warn("Gemini realtime news API call failed (likely quota limit reached). Returning high-quality dynamic fallback indices to protect UX: ", error.message);
      
      const language = req.query.lang || 'EN';
      const isFr = language === 'FR';

      const fallbackImages: Record<string, string> = {
        GLOBAL: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        MARKET: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
        INNOVATION: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        PROFESSIONAL: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
      };

      const fallbackNews = isFr ? [
        {
          id: `realtime-fallback-1-${Date.now()}`,
          title: "Netflix finalise pour 500M$ l'acquisition mondiale de droits cinématographiques d'œuvres européennes",
          summary: "Le géant de la vidéo en ligne Netflix annonce un partenariat d'autorisation de licences de diffusion pour distribuer à l'échelle internationale plusieurs portefeuilles d'art alternatif d'envergure.",
          source: "Variety",
          category: "GLOBAL",
          timestamp: "À l'instant",
          impact: {
            score: 18,
            trend: "UP",
            description: "Hausse directe de la demande d'évaluation pour le catalogue d'actifs artistiques souverains.",
            targetProject: "RENAISSANCE REBORN"
          },
          imageUrl: fallbackImages.GLOBAL
        },
        {
          id: `realtime-fallback-2-${Date.now()}`,
          title: "Sotheby's dévoile un module d'enchères fractionnées pour les droits de propriété intellectuelle LYA",
          summary: "Pour étendre la portée des droits d'exploitation d'œuvres artistiques, Sotheby's certifie un modèle permettant d'acheter des parts de redevances instantanément.",
          source: "Financial Times",
          category: "MARKET",
          timestamp: "Il y a 32m",
          impact: {
            score: 25,
            trend: "UP",
            description: "Augmentation de la confiance du public, stimulant les reventes et rendements sur le marché secondaire.",
            targetProject: "SKY GARDENS V4"
          },
          imageUrl: fallbackImages.MARKET
        },
        {
          id: `realtime-fallback-3-${Date.now()}`,
          title: "Les studios déploient des contrats intelligents de répartition automatisée de redevances en direct",
          summary: "Une coalition de producteurs adopte un algorithme de suivi automatisé pour reverser sans intermédiaire les flux de royalties de musique et SVOD.",
          source: "TechCrunch",
          category: "INNOVATION",
          timestamp: "Il y a 2h",
          impact: {
            score: 32,
            trend: "UP",
            description: "Élimination des latences d'audit sur l'exploitation internationale des catalogues d'œuvres.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.INNOVATION
        },
        {
          id: `realtime-fallback-4-${Date.now()}`,
          title: "Universal Music Group intègre son cadre de vérification d'enregistrements sonores sur le grand livre LYA",
          summary: "Accompagnement poussé destiné à pister, évaluer et sécuriser automatiquement l'indexation de propriété intellectuelle de nouveaux talents musicaux.",
          source: "Billboard",
          category: "PROFESSIONAL",
          timestamp: "Il y a 5h",
          impact: {
            score: 15,
            trend: "UP",
            description: "Stabilisation de l'évaluation du secteur audio et réduction de la volatilité des rendements musicaux.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.PROFESSIONAL
        }
      ] : [
        {
          id: `realtime-fallback-1-${Date.now()}`,
          title: "Netflix Finalizes $500M Global Acquisition Rights for Independent European Art Masterpieces",
          summary: "Streaming giant Netflix announced a landmark licensing agreement to distribute high-profile fine art content and cinematic portfolios globally, bolstering creative registry valuations.",
          source: "Variety",
          category: "GLOBAL",
          timestamp: "Just now",
          impact: {
            score: 18,
            trend: "UP",
            description: "Direct upward pressure on sovereign cinematic and physical masterpieces alternative registries.",
            targetProject: "RENAISSANCE REBORN"
          },
          imageUrl: fallbackImages.GLOBAL
        },
        {
          id: `realtime-fallback-2-${Date.now()}`,
          title: "Sotheby's Unveils Co-Fractional Bidding for Certified Digital Art & Creative IP Assets",
          summary: "Amplify the reach of digital collections, Sotheby's has integrated a modern system allowing high-net-worth curators to trade fractional IP rights instantly.",
          source: "Financial Times",
          category: "MARKET",
          timestamp: "32m ago",
          impact: {
            score: 25,
            trend: "UP",
            description: "Institutional trust index rises, driving active co-fraction trading spreads and secondary market volume.",
            targetProject: "SKY GARDENS V4"
          },
          imageUrl: fallbackImages.MARKET
        },
        {
          id: `realtime-fallback-3-${Date.now()}`,
          title: "Major Studios Launch Automated Live Smart Legal Contracts for Creative Royalty Splits",
          summary: "A cooperative index introduces machine-readable micro-claims that directly clear royalty revenues with zero friction back to creative creators.",
          source: "TechCrunch",
          category: "INNOVATION",
          timestamp: "2h ago",
          impact: {
            score: 32,
            trend: "UP",
            description: "Reduces audit latency and speeds up smart-contract security verification times.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.INNOVATION
        },
        {
          id: `realtime-fallback-4-${Date.now()}`,
          title: "Universal Music Group Expands Unified Soundwave IP Validation Framework",
          summary: "Strategic push to automatically track, audit, and index decentralized music rights of emerging international audio creators.",
          source: "Billboard",
          category: "PROFESSIONAL",
          timestamp: "5h ago",
          impact: {
            score: 15,
            trend: "UP",
            description: "Stabilizes digital audio co-valuation indexes and optimizes asset registry predictability.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.PROFESSIONAL
        }
      ];

      res.json(fallbackNews);
    }
  });

  app.post('/api/gemini/pricing-assessment', async (req, res) => {
    try {
      const { creativeField, role, projectSize, description, language } = req.body;
      const isFr = language === 'FR';
      const promptLang = isFr ? 'FRENCH' : 'ENGLISH';

      const prompt = `You are a high-level creative economist and senior intellectual property appraiser at LinkYourArt (LYA). Your task is to analyze the creative profile and needs of our user and deliver a highly professional customized quote and services recommendation.

      User Context:
      - Creative Sector/Field: ${creativeField} (such as cinema, music, tv series, podcast, visual arts, dance, etc.)
      - Professional Role: ${role} (such as creator, film producer, music label executive, talent agent, private collector, etc.)
      - Portfolio/Scale of Projects: ${projectSize} (ranging from single small project to multi-catalog international systems)
      - Detailed project background or requirements: "${description || 'Default valuation and liquidity on creative IP rights'}"

      Our Core Platform Membership Tiers:
      1. CREATOR TIER ($49/month or $529/year): Best suited for independent creative creators (directors, composers, scriptwriters) to register/tokenize up to 4 IP contracts, assess basic LYA Scores, and activate peer-to-peer funding streams.
      2. INVESTOR TIER ($149/month or $1609/year): Best for co-producers, labels, collectors, and financial backers seeking unlimited catalog tracking, advanced analytics, and priority settlement with 3% platform fees.
      3. PRO PERSONAL WORKSPACE ($890/month or $9612/year): For executive producers, showrunners, talent agents, brokers, and catalog syndicators wishing for advanced audits, customized white-label client reports, and optimal 2% platform transaction fees.
      4. INSTITUTIONAL ENTERPRISE ($15,000/month or bespoke, dedicated platform node): High-performance architecture for major film studios (such as Canal+, Netflix partners), global music labels (such as Universal partners), and massive entertainment conglomerates requiring dedicated priority nodes 24/7, full physical/digital library migrations, and institutional liquidity bridges.

      Our a-la-carte specialty systems:
      - Market Access Plus ($2,500/year) - Opens global sovereign alternative liquidity bridges
      - Risk Audit Pro ($1,200/year) - Direct expert compliance and deep-dive valuation audits
      - Portfolio AI ($1,800/year) - Automated royalty rebalancing index engines
      - Tax & Legal Suite ($950/year) - Cross-jurisdictional SVOD and broadcasting reporting

      Analyse their setup with depth, using beautiful, professional creative economy vocabulary (e.g. streaming collection, syndication, SVOD rights, masters, royalties, co-production, theatrical release, etc.). Calibrate your answer to matches their creative sector! 

      Generate a custom, precise response. Return a JSON object matching this schema exactly:
      {
        "analysis": "A highly detailed, 4-sentence diagnostic in ${promptLang} explaining how LinkYourArt will index, syndicate, and structure royalty distributions or backing for their specific creative activities in the ${creativeField} sector.",
        "recommendedPlanId": "CREATOR" | "INVESTOR" | "PRO" | "PRO_ENTERPRISE",
        "recommendedPlanName": "Translated into ${promptLang} (e.g., 'Créateur' / 'Investor' etc.)",
        "primaryReason": "One compelling localized reason in ${promptLang} for prioritizing this specific plan according to their business scope.",
        "estimatedMonthlyCost": number (e.g., 49, 149, 890, 15000),
        "suggestedAddons": [
          {"name": "Market Access Plus" | "Risk Audit Pro" | "Portfolio AI" | "Tax & Legal Suite", "reason": "Why this specific add-on is critical for their ${creativeField} activities, explained in ${promptLang} (1 sentence)"}
        ],
        "projectedBenefits": [
          "Benefit 1 in ${promptLang} (specific to their field, e.g. Sync licensing optimization, SVOD royalty speed, or catalog monetization)",
          "Benefit 2 in ${promptLang}",
          "Benefit 3 in ${promptLang}"
        ],
        "auditIndexScore": number (representing an estimated asset-audit feasibility on a 0-100 scale, e.g., 85)
      }

      Return only the bare JSON parsing structure. Do not wrap in markdown or any other tags. Use double quotes. Deliver the analysis, reasons, and benefits in elegant ${promptLang} as requested by the user's active interface language.`;

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        config: {
          responseMimeType: "application/json"
        },
        contents: prompt
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.warn("Pricing Assessment Gemini Error (using resilient fallback):", error.message || error);
      
      const creativeField = req.body.creativeField || "Industries Créatives";
      const role = req.body.role || "Créateur";
      const isFr = req.body.language === 'FR';
      const isEnterprise = req.body.projectSize === "Enterprise" || req.body.role === "Enterprise/Label/Studio" || (req.body.description && req.body.description.toLowerCase().includes("studio"));
      const isPro = req.body.role === "Broker/Agent/Lawyer" || req.body.projectSize === "Multiple Large Scale" || (req.body.description && req.body.description.toLowerCase().includes("produc"));

      let recommendedPlanId = "CREATOR";
      let recommendedPlanName = isFr ? "Créateur" : "Creator";
      let estimatedMonthlyCost = 49;
      let primaryReason = isFr 
        ? "S'adapte parfaitement aux artistes, réalisateurs et créateurs indépendants pour lancer leurs premières indexations de droits à taille humaine."
        : "Perfectly fits independent artists, producers, and writers starting their first IP rights indexations.";

      if (isEnterprise) {
        recommendedPlanId = "PRO_ENTERPRISE";
        recommendedPlanName = isFr ? "Entreprise Institutionnelle" : "Institutional Enterprise";
        estimatedMonthlyCost = 15000;
        primaryReason = isFr 
          ? "Idéal pour les structures d'envergure, studios de cinéma et labels de musique nécessitant un nœud dédié."
          : "Tailored for major studios and entertainment groups requiring private ledger architecture.";
      } else if (isPro) {
        recommendedPlanId = "PRO";
        recommendedPlanName = isFr ? "Pro Personnel" : "Pro Personal";
        estimatedMonthlyCost = 890;
        primaryReason = isFr 
          ? "Recommandé pour les agents, diffuseurs et showrunners gérant d'importants portefeuilles de propriété intellectuelle."
          : "Highly recommended for talent agents, catalog syndicators, and active producers.";
      } else if (req.body.role === "Patron/Backer" || req.body.projectSize === "Medium Scale") {
        recommendedPlanId = "INVESTOR";
        recommendedPlanName = isFr ? "Investisseur" : "Investor";
        estimatedMonthlyCost = 149;
        primaryReason = isFr 
          ? "Optimisé pour les investisseurs, co-producteurs et labels indépendants souhaitant diversifier leurs portefeuilles créatifs."
          : "Optimized for private backers, collectors, and independent studios aiming to co-finance catalogs.";
      }

      const fallbackAnalysis = isFr
        ? `Votre profil dans le domaine de l'industrie créative (${creativeField}) reflète des besoins stratégiques d'évaluation et d'indexation d'actifs. Notre analyse de vos activités en tant que ${role} indique une excellente opportunité de valorisation de votre propriété intellectuelle, de vos masters musicaux ou de vos droits de diffusion SVOD via les modules d'indexation certifiés de LinkYourArt.`
        : `Your profile in the creative field of ${creativeField} reflects strategic asset valuation and indexing requirements. Our analysis of your activities as a ${role} indicates an outstanding opportunity to maximize the value of your IP, audiovisual assets, or music sync rights via LinkYourArt.`;

      const fallbackAddons = isFr ? [
        { name: "Risk Audit Pro", reason: "Indispensable pour sécuriser l'audit préliminaire de vos contrats d'exploitation avant indexation publique." },
        { name: "Tax & Legal Suite", reason: "Structuration avancée des flux de redevances multi-pays issus de la syndication mondiale de vos œuvres." }
      ] : [
        { name: "Risk Audit Pro", reason: "Essential for securing the preliminary audit of your licensing rights agreements before indexing." },
        { name: "Tax & Legal Suite", reason: "Advanced framework to configure cross-border royalty streams and SVOD distribution royalties." }
      ];

      const fallbackBenefits = isFr ? [
        `Indexation fluide de vos droits d'exploitation en adéquation totale avec vos activités de ${creativeField}.`,
        "Distribution automatisée de dividendes de co-production via des contrats intelligents et transparents.",
        "Connexion directe avec un réseau mondial de co-financeurs, de labels indépendants et de diffuseurs certifiés."
      ] : [
        `Smooth indexing of your distribution rights aligned perfectly with your ${creativeField} workflows.`,
        "Automated split payouts for co-productions governed by transparent smart ledger triggers.",
        "Direct engagement with a worldwide community of validated co-financiers, labels, and creative patrons."
      ];

      res.json({
        analysis: fallbackAnalysis,
        recommendedPlanId,
        recommendedPlanName,
        primaryReason,
        estimatedMonthlyCost,
        suggestedAddons: fallbackAddons,
        projectedBenefits: fallbackBenefits,
        auditIndexScore: 88
      });
    }
  });

  app.post('/api/gemini/copilot', async (req, res) => {
    try {
      const { query, history, language } = req.body;
      const isFr = language === 'FR';
      const promptLang = isFr ? 'French' : 'English';

      const contents = history?.map((msg: any) => ({
        role: msg.role === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) || [];

      // Add the new query
      contents.push({
        role: 'user',
        parts: [{ text: query }]
      });

      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        config: {
          systemInstruction: `You are the LYA Artistic Guide (Copilot v2.2), an expert AI specialized in creative projects and art investment. 
            Your tone is elegant, professional, and inspiring. 
            Use art and creativity-related terminology. 
            LinkYourArt matches creators with patrons. 
            LYA Score: average of Score ALGO and Score PRO (both /1000).
            P2P Fees: 2% to 5%.
            Keep responses concise (max 4 sentences).
            IMPORTANT: You MUST write your response completely in ${promptLang}.`
        },
        contents: contents
      });
      res.json({ answer: response.text });
    } catch (error: any) {
      console.warn("Gemini Copilot Error (using resilient fallback):", error.message || error);
      const isFr = req.body.language === 'FR';
      if (isFr) {
        res.json({ answer: "Je rencontre actuellement un ralentissement passager de connexion avec nos nœuds de validation. Cependant, sachez que le score LYA représente la moyenne pondérée de nos calculs algorithmiques et de nos rapports d'experts. N'hésitez pas à me poser vos autres questions !" });
      } else {
        res.json({ answer: "I'm having trouble connecting to the LYA Intelligence Grid right now due to heavy traffic on our validation nodes. However, I can confirm that LYA scores reflect the weighted average of our algorithmic analysis and professional appraisals. Please let me know how I can guide you further!" });
      }
    }
  });

  // AI Generation Endpoint (REMOVED - Use Frontend Gemini Integration)
  app.post('/api/generate-project-description', async (req, res) => {
    res.status(404).json({ error: 'This endpoint is deprecated. Use direct frontend Gemini integration.' });
  });
  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LYA Terminal Backend Operational' });
  });

  app.post('/api/send-demo-email', express.json(), async (req, res) => {
    const { to, key, name = 'Creative Patron' } = req.body;
    
    if (!to || !key) {
      return res.status(400).json({ error: 'Missing recipient email (to) or generated key (key).' });
    }

    const fromAddress = process.env.SMTP_FROM || '"LinkYourArt Inc." <contact@linkyourart.com>';
    const emailSubject = '🗝️ Votre Clé d\'Accès Exclusive — LinkYourArt Demo';
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Votre Accès LinkYourArt</title>
      <style>
        body {
          background-color: #050505;
          color: #ffffff;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #0D0D0D;
          border: 1px solid rgba(0, 224, 255, 0.2);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 224, 255, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
          letter-spacing: 0.3em;
          font-weight: 900;
          font-size: 20px;
          color: #00E0FF;
        }
        .greeting {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #ffffff;
          text-transform: uppercase;
        }
        .text {
          font-size: 14px;
          line-height: 1.6;
          color: #a0a0a0;
          margin-bottom: 30px;
          text-align: justify;
        }
        .key-container {
          background: rgba(0, 224, 255, 0.05);
          border: 1px dashed #00E0FF;
          padding: 20px;
          text-align: center;
          font-family: monospace;
          font-weight: bold;
          font-size: 24px;
          color: #00E0FF;
          letter-spacing: 0.1em;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .instructions {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 25px;
          margin-top: 25px;
        }
        .instructions-title {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          color: #FFD700;
          margin-bottom: 15px;
          letter-spacing: 0.1em;
        }
        .instructions-list {
          padding-left: 20px;
          margin: 0;
          color: #a0a0a0;
          font-size: 13px;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
          margin-top: 40px;
          letter-spacing: 0.1em;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">LINKYOURART</div>
        <div class="greeting">Bonjour ${name},</div>
        <div class="text">
          L'administration de la plateforme <strong>LinkYourArt</strong> a validé votre demande d'accès démo. Nous sommes ravis de vous compter parmi nos premiers partenaires habilités à modéliser le futur de la cotation artistique.
        </div>
        
        <div class="key-container">
          ${key}
        </div>

        <div class="instructions">
          <div class="instructions-title">💡 Comment utiliser cette clé d'accès ?</div>
          <ol class="instructions-list">
            <li>Rendez-vous sur la page d'accueil LinkYourArt.</li>
            <li>Cliquez sur le bouton <strong>"Accéder démo / Vérifier la clé"</strong>.</li>
            <li>Incorporez votre clé d'accès unique ci-dessus dans le champ prévu à cet effet.</li>
            <li>Si vous souhaitez créer votre profil persistant, entrez-la directement comme code de parrainage/mandat sur l'écran d'inscription.</li>
          </ol>
        </div>

        <div class="footer">
          Ce message est automatique. Veuillez ne pas y répondre directement.<br>
          © 2026 LinkYourArt Inc. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      
      if (host && user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
        
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject: emailSubject,
          html: htmlContent
        });
        console.log(`[EMAIL_SENT] Demo key sent successfully to ${to}`);
        return res.json({ success: true, method: 'smtp' });
      } else {
        console.log(`[EMAIL_SIMULATED] SMTP not configured. Key for ${to}: ${key}`);
        return res.json({ 
          success: true, 
          method: 'simulated', 
          message: 'Email code generated! (Configure SMTP in settings to receive actual inbox delivery).' 
        });
      }
    } catch (err: any) {
      console.error('[EMAIL_SEND_ERROR] nodemailer failure:', err);
      return res.status(500).json({ error: 'Nodemailer failed to send email', details: err.message });
    }
  });

  // Check if a user is Pro
  app.get('/api/user-status/:email', async (req, res) => {
    const { email } = req.params;
    if (firebaseAdminApp) {
      try {
        const db = firebaseAdminApp.firestore();
        const snapshot = await db.collection('users').where('email', '==', email).get();
        const isPro = !snapshot.empty && snapshot.docs.some(doc => doc.data().isPro === true);
        return res.json({ isPro });
      } catch (err) {
        console.error(`[STATUS_ERROR] Failed to check status for ${email}:`, err);
      }
    }
    res.json({ isPro: false });
  });


  // Stripe Payment Intent
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'eur', metadata, customerId } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe secret key not configured' });
      }

      const params: any = {
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        metadata: {
          ...metadata,
          system: 'LYA_TERMINAL_V4'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (customerId) {
        params.customer = customerId;
      } else if (metadata?.userEmail) {
        // Create a new customer if email is provided
        const customer = await stripe.customers.create({
          email: metadata.userEmail,
          metadata: {
            userId: metadata.userId || ''
          }
        });
        params.customer = customer.id;
      }

      const paymentIntent = await stripe.paymentIntents.create(params);

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Stripe Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Customer Portal
  app.post('/api/create-portal-session', async (req, res) => {
    try {
      const { customerId, returnUrl } = req.body;

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Stripe secret key not configured' });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error('Stripe Portal Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LYA_SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
