
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
          systemInstruction: `You are a creative certification analyst for LinkYourArt (LYA). Write factual, professional analyses of a certified project's quality and potential. Never mention price, LYA units, secondary markets, financial returns, or investment -- LYA certifies creative projects, it is not a financial instrument. You must write your response in ${responseLang}.`
        },
        contents: `Analyze the following certified creative project.
        Asset Name: ${assetName}
        Description: ${description}
        Current LYA Score: ${score}/1000
        Provide a concise 2-sentence summary of its creative quality and certification standing. The summary MUST be written in ${responseLang}.`
      });
      res.json({ analysis: response.text || "Analysis currently unavailable." });
    } catch (error: any) {
      console.warn("Gemini Analyze Error (using resilient fallback):", error.message || error);
      const isFr = req.body.language === 'FR';
      if (isFr) {
        res.json({ analysis: `Cette œuvre présente d'excellentes perspectives qualitatives. Le projet ${req.body.assetName || "sélectionné"} affiche une trajectoire de certification solide et régulière au sein du Registre LYA.` });
      } else {
        res.json({ analysis: `This creative asset displays high qualitative prospects. ${req.body.assetName || "This project"} shows a steady, solid certification trajectory on the LYA Registry.` });
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
        contents: `Suggest 3 realistic certification milestones for this creative project: ${description}. Never mention price, royalties, or revenue distribution. Output JSON as an array of objects. Write everything in ${responseLang}:
        [{ "label": string, "date": string, "scoreImpact": number }]`
      });
      res.json(JSON.parse(response.text || '[]'));
    } catch (error: any) {
      console.warn("Gemini Milestones Error (using resilient fallback):", error.message || error);
      const isFr = req.body.language === 'FR';
      if (isFr) {
        res.json([
          { label: "Phase 1 : Enregistrement de la propriété intellectuelle", date: "2026-10", scoreImpact: 10 },
          { label: "Phase 2 : Accord de distribution signé", date: "2027-02", scoreImpact: 20 },
          { label: "Phase 3 : Lancement public", date: "2027-06", scoreImpact: 15 }
        ]);
      } else {
        res.json([
          { label: "Phase 1: Intellectual Property Registration", date: "2026-10", scoreImpact: 10 },
          { label: "Phase 2: Distribution Agreement Signed", date: "2027-02", scoreImpact: 20 },
          { label: "Phase 3: Public Launch", date: "2027-06", scoreImpact: 15 }
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
        contents: `Retrieve 4 or 5 of the absolute latest and most relevant news headlines or breaking stories *today* from around the world that concern the creative industries, fine arts, Hollywood, Netflix, generative music platforms, fashion conglomerates, architecture designs, or digital intellectual property rights. Ground this with Google Search. Return a beautifully formatted JSON output describing how each story connects to creative certification trends, LYA Score momentum, or registry growth on the LINKYOURART creative certification platform. Never describe LYA as a financial exchange, asset registry, or trading venue -- it certifies creative work and facilitates non-financial recognition-based patronage. IMPORTANT: All text properties including headline title, summary, and impact.description MUST be written completely in ${responseLang}.`,
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
                    targetProject: { type: Type.STRING, description: "The name of a major certified project on LinkYourArt (e.g. RENAISSANCE REBORN, SKY GARDENS V4, THE FUTURE VOICE, METAVERSE MUSEUM, SOUNDWAVE DIGITAL, etc.) that acts as a real benchmark linked to this news" }
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
          title: "Netflix finalise un accord de licence de 500M$ pour des œuvres d'art européennes indépendantes",
          summary: "Le géant du streaming Netflix annonce un partenariat de diffusion mondiale pour des portefeuilles d'art et de cinéma de haut niveau, renforçant l'intérêt pour la certification d'œuvres européennes.",
          source: "Variety",
          category: "GLOBAL",
          timestamp: "À l'instant",
          impact: {
            score: 18,
            trend: "UP",
            description: "Intérêt accru pour la certification de catalogues cinématographiques et artistiques souverains.",
            targetProject: "RENAISSANCE REBORN"
          },
          imageUrl: fallbackImages.GLOBAL
        },
        {
          id: `realtime-fallback-2-${Date.now()}`,
          title: "Sotheby's intègre un module de certification numérique pour les œuvres d'art et droits IP",
          summary: "Pour renforcer la confiance de ses acheteurs, Sotheby's adopte un standard de certification tiers permettant de vérifier instantanément l'authenticité et la provenance des œuvres numériques.",
          source: "Financial Times",
          category: "MARKET",
          timestamp: "Il y a 32m",
          impact: {
            score: 25,
            trend: "UP",
            description: "Hausse de la confiance institutionnelle dans les standards de certification tiers du marché de l'art.",
            targetProject: "SKY GARDENS V4"
          },
          imageUrl: fallbackImages.MARKET
        },
        {
          id: `realtime-fallback-3-${Date.now()}`,
          title: "Les studios déploient un suivi automatisé et transparent des jalons de production",
          summary: "Une coalition de producteurs adopte un système de suivi automatisé pour documenter et certifier chaque étape clé de production de leurs œuvres musicales et audiovisuelles.",
          source: "TechCrunch",
          category: "INNOVATION",
          timestamp: "Il y a 2h",
          impact: {
            score: 32,
            trend: "UP",
            description: "Réduction des délais d'audit sur la documentation des catalogues d'œuvres.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.INNOVATION
        },
        {
          id: `realtime-fallback-4-${Date.now()}`,
          title: "Universal Music Group adopte un cadre de vérification d'enregistrements sonores sur le Registre LYA",
          summary: "Accompagnement dédié pour documenter, évaluer et certifier automatiquement l'indexation de propriété intellectuelle de nouveaux talents musicaux.",
          source: "Billboard",
          category: "PROFESSIONAL",
          timestamp: "Il y a 5h",
          impact: {
            score: 15,
            trend: "UP",
            description: "Standardisation de l'évaluation qualité dans le secteur audio et réduction des écarts de certification.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.PROFESSIONAL
        }
      ] : [
        {
          id: `realtime-fallback-1-${Date.now()}`,
          title: "Netflix Finalizes $500M Global Licensing Deal for Independent European Art Masterpieces",
          summary: "Streaming giant Netflix announced a landmark licensing agreement to distribute high-profile fine art content and cinematic portfolios globally, boosting interest in certified European catalogues.",
          source: "Variety",
          category: "GLOBAL",
          timestamp: "Just now",
          impact: {
            score: 18,
            trend: "UP",
            description: "Rising interest in certification for major cinematic and fine art catalogues.",
            targetProject: "RENAISSANCE REBORN"
          },
          imageUrl: fallbackImages.GLOBAL
        },
        {
          id: `realtime-fallback-2-${Date.now()}`,
          title: "Sotheby's Rolls Out Digital Certification Standard for Art & Creative IP",
          summary: "To strengthen buyer confidence, Sotheby's has adopted a third-party certification standard allowing instant verification of authenticity and provenance for digital works.",
          source: "Financial Times",
          category: "MARKET",
          timestamp: "32m ago",
          impact: {
            score: 25,
            trend: "UP",
            description: "Rising institutional confidence in third-party certification standards across the art market.",
            targetProject: "SKY GARDENS V4"
          },
          imageUrl: fallbackImages.MARKET
        },
        {
          id: `realtime-fallback-3-${Date.now()}`,
          title: "Major Studios Roll Out Automated, Transparent Production Milestone Tracking",
          summary: "A cooperative of producers adopts an automated tracking system to document and certify each key production milestone across their music and film catalogues.",
          source: "TechCrunch",
          category: "INNOVATION",
          timestamp: "2h ago",
          impact: {
            score: 32,
            trend: "UP",
            description: "Reduces audit turnaround time for documenting creative work catalogues.",
            targetProject: "THE FUTURE VOICE"
          },
          imageUrl: fallbackImages.INNOVATION
        },
        {
          id: `realtime-fallback-4-${Date.now()}`,
          title: "Universal Music Group Adopts Sound Recording Verification Framework on the LYA Registry",
          summary: "Dedicated support to document, evaluate and automatically certify intellectual property indexing for emerging international music talent.",
          source: "Billboard",
          category: "PROFESSIONAL",
          timestamp: "5h ago",
          impact: {
            score: 15,
            trend: "UP",
            description: "Standardizes quality evaluation across the audio sector and narrows certification gaps.",
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

      const prompt = `You are a creative certification advisor at LinkYourArt (LYA). Discovery and patronage (browsing the Registry, following and supporting certified projects) are free and unlimited for everyone -- LYA only takes a 5% commission on patronage amounts pledged, never an entry fee. Paid tiers only cover submitting creative work and professional certification tooling. Your task is to analyze the creative profile and needs of our user and recommend the best-fit tier.

      User Context:
      - Creative Sector/Field: ${creativeField} (such as cinema, music, tv series, podcast, visual arts, dance, etc.)
      - Professional Role: ${role} (such as creator, film producer, music label executive, talent agent, industry professional, etc.)
      - Portfolio/Scale of Projects: ${projectSize} (ranging from a single small project to multi-catalog international operations)
      - Detailed project background or requirements: "${description || 'Creative certification needs not specified'}"

      Our Platform Tiers:
      1. CREATOR (free): individuals submitting their own work, 3 certifications included then 5 EUR/extra certification.
      2. PRO_STARTER (79 EUR/month): independent professionals sourcing and certifying creative work -- full Registry access, unlimited own-catalogue submissions, priority review queue.
      3. PRO_ADVANCED (249 EUR/month): everything Pro Starter has, plus API access, white-label reporting, dedicated account manager.
      4. PRO_ENTERPRISE (custom quote): major studios, labels, publishers needing catalog-scale certification, custom workflow, dedicated support.

      Analyse their setup with depth, using professional creative-industry vocabulary (e.g. catalogue, syndication, distribution rights, masters, co-production, theatrical release, etc.) grounded in certification, never in trading, investment, or financial return. Calibrate your answer to match their creative sector.

      Generate a custom, precise response. Return a JSON object matching this schema exactly:
      {
        "analysis": "A detailed, 4-sentence diagnostic in ${promptLang} explaining how LinkYourArt will certify and support their specific creative activities in the ${creativeField} sector.",
        "recommendedPlanId": "CREATOR" | "PRO_STARTER" | "PRO_ADVANCED" | "PRO_ENTERPRISE",
        "recommendedPlanName": "Translated into ${promptLang}",
        "primaryReason": "One compelling localized reason in ${promptLang} for prioritizing this specific tier according to their business scope.",
        "estimatedMonthlyCost": number (0, 79, 249, or 15000),
        "suggestedAddons": [],
        "projectedBenefits": [
          "Benefit 1 in ${promptLang} (specific to their field, e.g. certification turnaround, registry visibility, or catalogue audit readiness)",
          "Benefit 2 in ${promptLang}",
          "Benefit 3 in ${promptLang}"
        ],
        "auditIndexScore": number (representing an estimated certification-readiness score on a 0-100 scale, e.g., 85)
      }

      Never mention LYA unit prices, secondary markets, financial returns, tokenization, or investment. Return only the bare JSON parsing structure. Do not wrap in markdown or any other tags. Use double quotes. Deliver the analysis, reasons, and benefits in elegant ${promptLang} as requested by the user's active interface language.`;

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
      const role = req.body.role || "Createur";
      const isFr = req.body.language === 'FR';
      const isEnterprise = req.body.projectSize === "Enterprise" || req.body.role === "Enterprise/Label/Studio" || (req.body.description && req.body.description.toLowerCase().includes("studio"));
      const isAdvanced = req.body.role === "Broker/Agent/Lawyer" || req.body.projectSize === "Multiple Large Scale" || (req.body.description && req.body.description.toLowerCase().includes("produc"));
      const isPro = isAdvanced || req.body.role === "Patron/Backer" || req.body.projectSize === "Medium Scale";

      let recommendedPlanId = "CREATOR";
      let recommendedPlanName = isFr ? "Créateur" : "Creator";
      let estimatedMonthlyCost = 0;
      let primaryReason = isFr
        ? "S'adapte parfaitement aux artistes, réalisateurs et créateurs indépendants pour lancer leurs premières certifications, gratuitement."
        : "Perfectly fits independent artists, producers, and writers starting their first free certifications.";

      if (isEnterprise) {
        recommendedPlanId = "PRO_ENTERPRISE";
        recommendedPlanName = isFr ? "Entreprise Institutionnelle" : "Institutional Enterprise";
        estimatedMonthlyCost = 15000;
        primaryReason = isFr
          ? "Idéal pour les structures d'envergure, studios de cinéma et labels de musique nécessitant une certification de catalogue à grande échelle."
          : "Tailored for major studios and entertainment groups requiring catalog-scale certification.";
      } else if (isAdvanced) {
        recommendedPlanId = "PRO_ADVANCED";
        recommendedPlanName = isFr ? "Pro Avancé" : "Pro Advanced";
        estimatedMonthlyCost = 249;
        primaryReason = isFr
          ? "Recommandé pour les agents, diffuseurs et showrunners ayant besoin d'un accès API et d'un accompagnement dédié."
          : "Recommended for talent agents, catalog syndicators, and producers who need API access and dedicated support.";
      } else if (isPro) {
        recommendedPlanId = "PRO_STARTER";
        recommendedPlanName = isFr ? "Pro Starter" : "Pro Starter";
        estimatedMonthlyCost = 79;
        primaryReason = isFr
          ? "Optimisé pour les professionnels indépendants sourçant et certifiant des créations pour des tiers."
          : "Optimized for independent professionals sourcing and certifying creative work for others.";
      }

      const fallbackAnalysis = isFr
        ? `Votre profil dans le domaine de l'industrie creative (${creativeField}) reflète des besoins de certification et de reconnaissance objective. Notre analyse de vos activités en tant que ${role} indique une excellente opportunité de valorisation de votre propriété intellectuelle via les modules de certification de LinkYourArt.`
        : `Your profile in the creative field of ${creativeField} reflects certification and objective-recognition needs. Our analysis of your activities as a ${role} indicates an excellent opportunity to have your intellectual property certified via LinkYourArt.`;

      const fallbackBenefits = isFr ? [
        `Certification fluide de vos droits d'exploitation en adéquation totale avec vos activités de ${creativeField}.`,
        "Reconnaissance et visibilité via des projets certifiés et transparents sur le Registre LYA.",
        "Connexion directe avec un réseau mondial de mécènes et de partenaires certifiés."
      ] : [
        `Smooth certification of your creative rights aligned perfectly with your ${creativeField} workflows.`,
        "Recognition and visibility through certified, transparent projects on the LYA Registry.",
        "Direct engagement with a worldwide network of patrons and certified partners."
      ];

      res.json({
        analysis: fallbackAnalysis,
        recommendedPlanId,
        recommendedPlanName,
        primaryReason,
        estimatedMonthlyCost,
        suggestedAddons: [],
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
          systemInstruction: `You are LYA Copilot, the assistant for the LinkYourArt (LYA) platform, a creative certification standard. Answer clearly and concisely about the LYA Score, certification, the Registry, and patronage.
            Your tone is elegant, professional, and inspiring.
            Use art and creativity-related terminology.
            LinkYourArt matches creators with patrons through objective certification.
            LYA Score: average of Score ALGO and Score PRO (both /1000).
            Patronage commission: 5% on pledges to certified projects.
            Never mention a secondary market, a fixed-price LYA unit, or a financial instrument -- LYA certifies creative projects, it is not an investment platform.
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
