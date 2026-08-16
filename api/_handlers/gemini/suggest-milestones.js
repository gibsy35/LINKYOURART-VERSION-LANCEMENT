module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { description, language } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = [
    { label: 'Phase 1: Intellectual Property Registration', date: '2026-10', scoreImpact: 10 },
    { label: 'Phase 2: Distribution Agreement Signed', date: '2027-02', scoreImpact: 20 },
    { label: 'Phase 3: Public Launch', date: '2027-06', scoreImpact: 15 }
  ];
  if (!apiKey) return res.status(200).json(fallback);

  const isFR = language === 'FR';
  const systemPrompt = isFR
    ? `Tu es un conseiller en certification créative pour LinkYourArt (LYA). Tu proposes des jalons de projet réalistes pour aider un créateur à structurer son parcours vers la certification. Réponds UNIQUEMENT en JSON valide, un tableau, sans texte avant/après, sans backticks. Format exact : [{"label": "Nom du jalon", "date": "AAAA-MM", "scoreImpact": 10}]. Propose 3 à 4 jalons. scoreImpact doit être un nombre entre 5 et 25. Ne mentionne jamais de prix, de royalties, ou de distribution de revenus.`
    : `You are a creative certification advisor for LinkYourArt (LYA). You suggest realistic project milestones to help a creator structure their path toward certification. Respond ONLY with valid JSON, an array, no text before/after, no backticks. Exact format: [{"label": "Milestone name", "date": "YYYY-MM", "scoreImpact": 10}]. Suggest 3 to 4 milestones. scoreImpact must be a number between 5 and 25. Never mention price, royalties, or revenue distribution.`;

  const userPrompt = isFR
    ? `Description du projet créatif : ${description || 'Projet créatif non spécifié.'}\n\nPropose 3 à 4 jalons réalistes pour ce projet, avec des dates approximatives à partir d'aujourd'hui.`
    : `Creative project description: ${description || 'Unspecified creative project.'}\n\nSuggest 3 to 4 realistic milestones for this project, with approximate dates starting from today.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 500, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(200).json(fallback);
    const milestones = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(milestones) || milestones.length === 0) return res.status(200).json(fallback);
    return res.status(200).json(milestones);
  } catch (e) {
    console.error('[SUGGEST-MILESTONES] Error:', e.message);
    return res.status(200).json(fallback);
  }
};
