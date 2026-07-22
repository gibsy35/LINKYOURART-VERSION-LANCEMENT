module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { creativeField, role, projectSize, description, language } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const isEnterprise = (projectSize || '').includes('Enterprise');
  const isPro = !isEnterprise && ((role || '').includes('Producer') || (creativeField || '').includes('Cinema'));
  const fallback = {
    analysis: "Votre profil dans le domaine de la création reflète des besoins de certification et de reconnaissance objective. Notre analyse de vos activités indique une excellente opportunité de valorisation de votre propriété intellectuelle et de vos droits d'auteur via les modules de certification de LinkYourArt.",
    recommendedPlanId: isEnterprise ? 'PRO_ENTERPRISE' : isPro ? 'PRO' : 'PATRON',
    recommendedPlanName: isEnterprise ? 'Entreprise Institutionnelle' : isPro ? 'Pro Personnel' : 'Mécène',
    primaryReason: "Recommandé pour optimiser d'importants portefeuilles de propriété intellectuelle avec rapports personnalisés pour les partenaires créatifs.",
    estimatedMonthlyCost: isEnterprise ? 15000 : isPro ? 299 : 9,
    suggestedAddons: [],
    projectedBenefits: [
      "Certification fluide de vos droits d'exploitation en adéquation totale avec vos activités d'artiste.",
      "Reconnaissance et contreparties personnelles via des projets certifiés et transparents.",
      "Connexion directe avec un réseau mondial de mécènes et de partenaires certifiés."
    ],
    auditIndexScore: 84
  };
  if (!apiKey) return res.status(200).json(fallback);

  const isFR = language === 'FR';
  const systemPrompt = isFR
    ? `Tu es un conseiller en certification créative pour LinkYourArt (LYA), une plateforme de certification de projets créatifs. LYA propose 4 profils : CREATOR (gratuit, individus, 2 projets), PATRON (9€/mois + 5% de frais sur le mécénat, mécènes qui soutiennent des projets), PRO (299€/mois, professionnels/agents indépendants), PRO_ENTERPRISE (sur devis, studios/labels/éditeurs). Analyse le profil fourni et recommande le forfait le plus adapté.

Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans backticks. Format exact :
{
  "analysis": "2-3 phrases d'analyse du profil créatif de la personne",
  "recommendedPlanId": "CREATOR" | "PATRON" | "PRO" | "PRO_ENTERPRISE",
  "recommendedPlanName": "Nom du forfait en français",
  "primaryReason": "1 phrase expliquant pourquoi ce forfait est recommandé",
  "estimatedMonthlyCost": nombre (0, 9, 299 ou 15000 selon le forfait),
  "suggestedAddons": [],
  "projectedBenefits": ["bénéfice 1", "bénéfice 2", "bénéfice 3"],
  "auditIndexScore": nombre entre 60 et 95
}

Ne mentionne jamais de prix d'unité LYA, de marché secondaire, de rendement financier, ou d'investissement.`
    : `You are a creative certification advisor for LinkYourArt (LYA), a certification platform for creative projects. LYA offers 4 tiers: CREATOR (free, individuals, 2 projects), PATRON (€9/month + 5% patronage fee, patrons supporting projects), PRO (€299/month, independent professionals/agents), PRO_ENTERPRISE (custom quote, studios/labels/publishers). Analyze the provided profile and recommend the best-fit plan.

Respond ONLY with valid JSON, no text before/after, no backticks. Exact format:
{
  "analysis": "2-3 sentence analysis of the person's creative profile",
  "recommendedPlanId": "CREATOR" | "PATRON" | "PRO" | "PRO_ENTERPRISE",
  "recommendedPlanName": "Plan name in English",
  "primaryReason": "1 sentence explaining why this plan is recommended",
  "estimatedMonthlyCost": number (0, 9, 299 or 15000 depending on plan),
  "suggestedAddons": [],
  "projectedBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "auditIndexScore": number between 60 and 95
}

Never mention LYA unit prices, secondary markets, financial returns, or investment.`;

  const userPrompt = isFR
    ? `Secteur créatif : ${creativeField || 'Non spécifié'}\nRôle : ${role || 'Non spécifié'}\nTaille de projet : ${projectSize || 'Non spécifiée'}\nBesoins décrits : ${description || 'Aucun détail fourni'}`
    : `Creative field: ${creativeField || 'Unspecified'}\nRole: ${role || 'Unspecified'}\nProject size: ${projectSize || 'Unspecified'}\nDescribed needs: ${description || 'No details provided'}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
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
