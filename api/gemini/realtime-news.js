module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const lang = req.query.lang || 'EN';
  const isFR = lang === 'FR';
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ news: [] });
  }

  const systemPrompt = isFR
    ? `Tu es un analyste expert de l'économie créative mondiale pour la plateforme LinkYourArt (LYA).
LinkYourArt est une plateforme de co-propriété artistique où des projets créatifs (musique, cinéma, mode, gaming, architecture, séries TV, art visuel) ont des "LYA Units" à $50 de base, un "LYA Score" sur 1000, et des variations de valeur.

Ton rôle : analyser les actualités mondiales du monde créatif et calculer leur impact direct sur les indices LYA.

Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après, sans backticks, sans markdown.
Format exact :
[
  {
    "id": "news_1",
    "title": "Titre de l'actualité",
    "summary": "Résumé en 2-3 phrases expliquant l'événement",
    "category": "GLOBAL",
    "source": "Nom de la source",
    "timestamp": "Il y a X minutes",
    "imageUrl": "",
    "impact": {
      "score": 12,
      "trend": "UP",
      "description": "Impact sur les indices LYA : +12 pts sur le secteur Film. Les projets cinématographiques européens voient leur LYA Unit progresser. Impact direct sur Chronicle of Eldon (+8pts LYA Score).",
      "affectedSectors": ["Film", "TV Series"],
      "lyaUnitVariation": "+2.4%",
      "targetProject": "Nom d'un projet LYA concerné si applicable"
    }
  }
]`
    : `You are an expert analyst of the global creative economy for the LinkYourArt (LYA) platform.
LinkYourArt is an artistic co-ownership platform where creative projects (music, film, fashion, gaming, architecture, TV series, visual art) have "LYA Units" at $50 base, a "LYA Score" out of 1000, and value variations.

Your role: analyze global creative industry news and calculate their direct impact on LYA indices.

Respond ONLY with valid JSON, no text before or after, no backticks, no markdown.
Exact format:
[
  {
    "id": "news_1",
    "title": "News headline",
    "summary": "2-3 sentence summary explaining the event",
    "category": "GLOBAL",
    "source": "Source name",
    "timestamp": "X minutes ago",
    "imageUrl": "",
    "impact": {
      "score": 12,
      "trend": "UP",
      "description": "LYA index impact: +12pts on Film sector. European cinematic projects see LYA Unit progress. Direct impact on Chronicle of Eldon (+8pts LYA Score).",
      "affectedSectors": ["Film", "TV Series"],
      "lyaUnitVariation": "+2.4%",
      "targetProject": "LYA project name if applicable"
    }
  }
]`;

  const userPrompt = isFR
    ? `Recherche les 6 actualités les plus importantes et récentes du monde créatif mondial (musique, cinéma, mode, gaming, art, architecture, séries TV, droits d'auteur, streaming, festivals, awards).

Pour chaque actualité :
1. Explique l'événement clairement
2. Calcule l'impact précis sur les indices LYA (hausse/baisse en points, secteurs affectés, variation LYA Unit en %)
3. Mentionne si un type de projet LYA est directement concerné

Catégories disponibles : GLOBAL, MARKET, INNOVATION, PROFESSIONAL

Assure-toi que les news couvrent différents secteurs créatifs et continents.`
    : `Search for the 6 most important and recent global creative industry news (music, film, fashion, gaming, art, architecture, TV series, copyright, streaming, festivals, awards).

For each news item:
1. Clearly explain the event
2. Calculate the precise LYA index impact (rise/fall in points, affected sectors, LYA Unit variation in %)
3. Mention if a type of LYA project is directly concerned

Available categories: GLOBAL, MARKET, INNOVATION, PROFESSIONAL

Make sure news covers different creative sectors and continents.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: systemPrompt,
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search'
        }],
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('[NEWS] API error:', data.error);
      return res.status(200).json({ news: [] });
    }

    // Extraire le texte JSON de la réponse (peut être après des tool_use blocks)
    const textBlocks = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    if (!textBlocks) {
      console.log('[NEWS] No text in response');
      return res.status(200).json({ news: [] });
    }

    // Parser le JSON
    const jsonMatch = textBlocks.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log('[NEWS] No JSON array found in:', textBlocks.slice(0, 200));
      return res.status(200).json({ news: [] });
    }

    const newsItems = JSON.parse(jsonMatch[0]);
    
    // Ajouter des images Unsplash selon la catégorie/secteur
    const categoryImages = {
      'Film': 'photo-1478720568477-152d9b164e26',
      'Music': 'photo-1493225457124-a3eb161ffa5f',
      'Fashion': 'photo-1558618666-fcd25c85cd64',
      'Gaming': 'photo-1535016120720-40c646be5580',
      'Architecture': 'photo-1486325212027-8081e485255e',
      'TV Series': 'photo-1574375927938-d5a98e8edd86',
      'Art': 'photo-1541367777708-7905fe3296c0',
      'GLOBAL': 'photo-1611162617213-7d7a39e9b1d7',
      'MARKET': 'photo-1611162616305-c69b3fa7fbe0',
      'INNOVATION': 'photo-1519389950473-47ba0277781c',
      'PROFESSIONAL': 'photo-1560472354-b33ff0c44a43',
    };

    const enriched = newsItems.map((item, idx) => {
      const sector = item.impact?.affectedSectors?.[0] || item.category || 'GLOBAL';
      const photoId = categoryImages[sector] || categoryImages[item.category] || categoryImages['GLOBAL'];
      return {
        ...item,
        id: item.id || `live_${Date.now()}_${idx}`,
        imageUrl: item.imageUrl || `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=800`,
      };
    });

    console.log(`[NEWS] ✓ ${enriched.length} news générées en ${lang}`);
    return res.status(200).json({ news: enriched });

  } catch (err) {
    console.error('[NEWS] Error:', err.message);
    return res.status(200).json({ news: [] });
  }
};
