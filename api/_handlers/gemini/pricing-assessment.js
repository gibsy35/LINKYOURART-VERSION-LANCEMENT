const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { creativeField, role, projectSize, description, language } = req.body || {};
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  const isEnterprise = (projectSize || '').includes('Enterprise');
  const isAdvanced = !isEnterprise && ((role || '').includes('Producer') || (creativeField || '').includes('Cinema'));
  const isPro = isAdvanced || (!isEnterprise && (role || '').toLowerCase().includes('pro'));
  const isFR = language === 'FR';
  const fallback = isFR ? {
    analysis: "Votre profil dans le domaine de la création reflète des besoins de certification et de reconnaissance objective. Notre analyse de vos activités indique une excellente opportunité de valorisation de votre propriété intellectuelle et de vos droits d'auteur via les modules de certification de LinkYourArt.",
    recommendedPlanId: isEnterprise ? 'PRO_ENTERPRISE' : isAdvanced ? 'PRO_ADVANCED' : isPro ? 'PRO_STARTER' : 'CREATOR',
    recommendedPlanName: isEnterprise ? 'Entreprise Institutionnelle' : isAdvanced ? 'Pro Avancé' : isPro ? 'Pro Starter' : 'Créateur',
    primaryReason: "Recommandé pour optimiser d'importants portefeuilles de propriété intellectuelle avec rapports personnalisés pour les partenaires créatifs.",
    estimatedMonthlyCost: isEnterprise ? 15000 : isAdvanced ? 249 : isPro ? 79 : 0,
    suggestedAddons: [],
    projectedBenefits: [
      "Certification fluide de vos droits d'exploitation en adéquation totale avec vos activités d'artiste.",
      "Reconnaissance et contreparties personnelles via des projets certifiés et transparents.",
      "Connexion directe avec un réseau mondial de mécènes et de partenaires certifiés."
    ],
    auditIndexScore: 84
  } : {
    analysis: "Your creative profile reflects a need for certification and objective recognition. Our analysis of your activity indicates a strong opportunity to unlock the value of your intellectual property and authorship rights through LinkYourArt's certification modules.",
    recommendedPlanId: isEnterprise ? 'PRO_ENTERPRISE' : isAdvanced ? 'PRO_ADVANCED' : isPro ? 'PRO_STARTER' : 'CREATOR',
    recommendedPlanName: isEnterprise ? 'Institutional Enterprise' : isAdvanced ? 'Pro Advanced' : isPro ? 'Pro Starter' : 'Creator',
    primaryReason: "Recommended to optimize significant intellectual property portfolios with tailored reporting for creative partners.",
    estimatedMonthlyCost: isEnterprise ? 15000 : isAdvanced ? 249 : isPro ? 79 : 0,
    suggestedAddons: [],
    projectedBenefits: [
      "Seamless certification of your exploitation rights, fully aligned with your work as an artist.",
      "Recognition and personal upside through certified, transparent projects.",
      "Direct connection to a worldwide network of certified patrons and partners."
    ],
    auditIndexScore: 84
  };
  if (!apiKey) return res.status(200).json(fallback);

  const systemPrompt = isFR
    ? `Tu es un conseiller en certification créative pour LinkYourArt (LYA), une plateforme de certification de projets créatifs. La découverte et le mécénat (parcourir le Registre, suivre et soutenir des projets certifiés) sont gratuits et illimités pour tout le monde — LYA prélève uniquement une commission de 5% sur les montants de mécénat versés, jamais de frais d'entrée. Les paliers payants ne concernent que la soumission de créations et les outils de certification professionnelle : CREATOR (gratuit, individus, 3 projets inclus puis 5€/certification supplémentaire), PRO_STARTER (79€/mois, professionnels indépendants — Registre complet, soumissions illimitées, file de revue prioritaire), PRO_ADVANCED (249€/mois, tout Pro Starter + accès API, rapports en marque blanche, gestionnaire de compte dédié), PRO_ENTERPRISE (sur devis, studios/labels/éditeurs — certification de catalogue à grande échelle). Analyse le profil fourni et recommande le forfait le plus adapté.

Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans backticks. Format exact :
{
  "analysis": "2-3 phrases d'analyse du profil créatif de la personne",
  "recommendedPlanId": "CREATOR" | "PRO_STARTER" | "PRO_ADVANCED" | "PRO_ENTERPRISE",
  "recommendedPlanName": "Nom du forfait en français",
  "primaryReason": "1 phrase expliquant pourquoi ce forfait est recommandé",
  "estimatedMonthlyCost": nombre (0, 79, 249 ou 15000 selon le forfait),
  "suggestedAddons": [],
  "projectedBenefits": ["bénéfice 1", "bénéfice 2", "bénéfice 3"],
  "auditIndexScore": nombre entre 60 et 95
}

Ne mentionne jamais de prix d'unité LYA, de marché secondaire, de rendement financier, ou d'investissement.`
    : `You are a creative certification advisor for LinkYourArt (LYA), a certification platform for creative projects. Discovery and patronage (browsing the Registry, following and supporting certified projects) are free and unlimited for everyone — LYA only takes a 5% commission on patronage amounts pledged, never an entry fee. Paid tiers only cover submitting creative work and professional certification tooling: CREATOR (free, individuals, 3 projects included then €5/extra certification), PRO_STARTER (€79/month, independent professionals — full Registry access, unlimited submissions, priority review queue), PRO_ADVANCED (€249/month, everything Pro Starter has plus API access, white-label reporting, dedicated account manager), PRO_ENTERPRISE (custom quote, studios/labels/publishers — catalog-scale certification). Analyze the provided profile and recommend the best-fit plan.

Respond ONLY with valid JSON, no text before/after, no backticks. Exact format:
{
  "analysis": "2-3 sentence analysis of the person's creative profile",
  "recommendedPlanId": "CREATOR" | "PRO_STARTER" | "PRO_ADVANCED" | "PRO_ENTERPRISE",
  "recommendedPlanName": "Plan name in English",
  "primaryReason": "1 sentence explaining why this plan is recommended",
  "estimatedMonthlyCost": number (0, 79, 249 or 15000 depending on plan),
  "suggestedAddons": [],
  "projectedBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "auditIndexScore": number between 60 and 95
}

Never mention LYA unit prices, secondary markets, financial returns, or investment.`;

  const userPrompt = isFR
    ? `Secteur créatif : ${creativeField || 'Non spécifié'}\nRôle : ${role || 'Non spécifié'}\nTaille de projet : ${projectSize || 'Non spécifiée'}\nBesoins décrits : ${description || 'Aucun détail fourni'}`
    : `Creative field: ${creativeField || 'Unspecified'}\nRole: ${role || 'Unspecified'}\nProject size: ${projectSize || 'Unspecified'}\nDescribed needs: ${description || 'No details provided'}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: { systemInstruction: systemPrompt, responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'low' } },
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(200).json(fallback);
    const result = JSON.parse(jsonMatch[0]);
    if (!result || !result.recommendedPlanId) return res.status(200).json(fallback);
    return res.status(200).json(result);
  } catch (e) {
    console.error('[PRICING-ASSESSMENT] Error:', e.message);
    return res.status(200).json(fallback);
  }
};
