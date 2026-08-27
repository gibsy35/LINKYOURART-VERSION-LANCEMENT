const { GoogleGenAI } = require('@google/genai');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// IMPORTANT : ce module est require() de façon EAGER par gemini-router.js
// (tous les handlers sont chargés en un seul objet au démarrage — voir ce
// fichier). Si initializeApp()/cert() lève une exception ici, au niveau
// module (ex. FIREBASE_PRIVATE_KEY mal formée), le require() lui-même
// plante, ce qui fait tomber TOUT le routeur Gemini — copilot,
// analyse d'œuvre, tout — pas seulement les actualités. D'où le try/catch :
// une panne d'initialisation Firestore ne doit jamais empêcher le reste
// de l'app de fonctionner ; elle désactive juste la mise en correspondance
// avec les vrais projets pour cette fonctionnalité précise.
let firebaseAdminReady = false;
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'linkyourart-cb221',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  firebaseAdminReady = true;
} catch (initErr) {
  console.error('[NEWS] Firebase Admin init failed (continuing without real-project matching):', initErr.message);
}

// Catégories réelles utilisées par les projets LYA (voir src/types.ts)
const LYA_CATEGORIES = [
  'Fine Art', 'Film', 'TV Series', 'Music', 'Digital Art', 'Gaming',
  'Literature', 'Fashion', 'Architecture', 'Design', 'Photography',
  'Podcast', 'Performing Arts', 'Gastronomy'
];

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const lang = req.query.lang || 'EN';
  const isFR = lang === 'FR';
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ news: [] });
  }

  // NOTE IMPORTANTE : le modèle ne doit produire QUE ce qu'il peut
  // réellement établir via la recherche web (titre, résumé, source,
  // secteurs concernés). Il ne lui est plus demandé d'inventer un
  // "score d'impact" ni un "projet LYA concerné" — ces deux champs
  // n'existaient nulle part dans une réalité vérifiable et étaient de
  // purs chiffres/associations fabriqués par le modèle. La pertinence
  // pour LYA (projets réellement concernés, score LYA moyen réel) est
  // calculée plus bas, côté serveur, à partir des vraies données
  // Firestore — jamais générée par le modèle.
  const systemPrompt = isFR
    ? `Tu es un analyste de l'économie créative mondiale. Réponds UNIQUEMENT en JSON valide, sans texte avant/après, sans backticks, sans markdown.
Format exact :
[
  {
    "id": "news_1",
    "title": "Titre de l'actualité",
    "summary": "Résumé factuel en 2-3 phrases",
    "category": "GLOBAL",
    "source": "Nom de la source réelle",
    "timestamp": "Il y a X minutes",
    "affectedSectors": ["Film", "TV Series"]
  }
]
"affectedSectors" doit être choisi UNIQUEMENT parmi cette liste exacte, en ne citant que les secteurs réellement concernés par l'article : ${LYA_CATEGORIES.join(', ')}.
Catégories disponibles pour "category" : GLOBAL, INDUSTRY, INNOVATION, PROFESSIONAL.
Ne produis AUCUN champ d'estimation, de score ou de tendance — uniquement des faits vérifiables par la recherche.`
    : `You are an analyst of the global creative economy. Respond ONLY with valid JSON, no text before/after, no backticks, no markdown.
Exact format:
[
  {
    "id": "news_1",
    "title": "News headline",
    "summary": "Factual 2-3 sentence summary",
    "category": "GLOBAL",
    "source": "Real source name",
    "timestamp": "X minutes ago",
    "affectedSectors": ["Film", "TV Series"]
  }
]
"affectedSectors" must be chosen ONLY from this exact list, citing only sectors genuinely relevant to the article: ${LYA_CATEGORIES.join(', ')}.
Available "category" values: GLOBAL, INDUSTRY, INNOVATION, PROFESSIONAL.
Do NOT produce any estimated field, score, or trend — facts verifiable via search only.`;

  const userPrompt = isFR
    ? `Recherche les 6 actualités les plus importantes et récentes du monde créatif mondial (musique, cinéma, mode, gaming, art, architecture, séries TV, droits d'auteur, streaming, festivals, awards). Assure-toi que les news couvrent différents secteurs créatifs et continents. Réponds uniquement avec le tableau JSON, sans texte avant ou après.`
    : `Search for the 6 most important and recent global creative industry news (music, film, fashion, gaming, art, architecture, TV series, copyright, streaming, festivals, awards). Make sure news covers different creative sectors and continents. Respond only with the JSON array, no text before or after.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    });

    const textBlocks = response.text || '';
    if (!textBlocks) {
      return res.status(200).json({ news: [] });
    }

    const jsonMatch = textBlocks.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log('[NEWS] No JSON array found in:', textBlocks.slice(0, 200));
      return res.status(200).json({ news: [] });
    }

    const newsItems = JSON.parse(jsonMatch[0]);

    // Vraies sources citées par la recherche Google (jamais générées par
    // le modèle) — voir groundingChunks dans la doc officielle Gemini.
    // On ne demande PAS au modèle d'écrire lui-même une URL dans son JSON :
    // un LLM peut inventer une URL plausible mais fausse. Ici, chaque uri
    // vient réellement d'un résultat de recherche que le modèle a consulté.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const realSources = groundingChunks
      .map(c => c.web)
      .filter(w => w && w.uri);

    const categoryImages = {
      'Film': 'photo-1478720568477-152d9b164e26',
      'Music': 'photo-1493225457124-a3eb161ffa5f',
      'Fashion': 'photo-1558618666-fcd25c85cd64',
      'Gaming': 'photo-1535016120720-40c646be5580',
      'Architecture': 'photo-1486325212027-8081e485255e',
      'TV Series': 'photo-1574375927938-d5a98e8edd86',
      'Fine Art': 'photo-1541367777708-7905fe3296c0',
      'GLOBAL': 'photo-1611162617213-7d7a39e9b1d7',
      'INNOVATION': 'photo-1519389950473-47ba0277781c',
      'PROFESSIONAL': 'photo-1560472354-b33ff0c44a43',
    };

    // Correspondance réelle avec les projets certifiés sur LYA — remplace
    // entièrement l'ancien "impact score" fabriqué par le modèle.
    let realContracts = [];
    if (firebaseAdminReady) {
      try {
        const db = getFirestore();
        const snap = await db.collection('contracts').select('category', 'totalScore').limit(500).get();
        realContracts = snap.docs.map(d => d.data());
      } catch (fsErr) {
        console.warn('[NEWS] Firestore contracts fetch failed (matching skipped):', fsErr.message);
      }
    }

    // Normalise un nom de source pour comparaison (minuscules, sans
    // espaces/ponctuation/TLD) — ex. "TechCrunch" et "techcrunch.com"
    // doivent matcher malgré la différence de format.
    const normalize = (s) => (s || '').toLowerCase().replace(/\.(com|org|net|co|fr|io)$/i, '').replace(/[^a-z0-9]/g, '');

    const enriched = newsItems.map((item, idx) => {
      const sectors = Array.isArray(item.affectedSectors)
        ? item.affectedSectors.filter(s => LYA_CATEGORIES.includes(s))
        : [];
      const sector = sectors[0] || item.category || 'GLOBAL';
      const photoId = categoryImages[sector] || categoryImages[item.category] || categoryImages['GLOBAL'];

      let relatedProjects = null;
      if (sectors.length > 0 && realContracts.length > 0) {
        const matching = realContracts.filter(c => sectors.includes(c.category));
        if (matching.length > 0) {
          const avgScore = matching.reduce((sum, c) => sum + (c.totalScore || 0), 0) / matching.length;
          relatedProjects = {
            count: matching.length,
            avgLyaScore: Math.round(avgScore),
            categories: sectors,
          };
        }
      }

      // Lien source réel — uniquement si le nom de source annoncé par le
      // modèle correspond à l'un des titres/domaines réellement cités par
      // la recherche Google. Aucune correspondance fiable → pas de lien,
      // jamais une URL approximative ou devinée.
      const normalizedSource = normalize(item.source);
      const matchedSource = normalizedSource
        ? realSources.find(s => {
            const t = normalize(s.title);
            return t && (t.includes(normalizedSource) || normalizedSource.includes(t));
          })
        : null;

      return {
        id: item.id || `live_${Date.now()}_${idx}`,
        category: item.category,
        title: item.title,
        summary: item.summary,
        timestamp: item.timestamp,
        source: item.source,
        url: matchedSource ? matchedSource.uri : undefined,
        imageUrl: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=800`,
        relatedProjects, // null si aucun projet réel correspondant — jamais estimé
      };
    });

    console.log(`[NEWS] ✓ ${enriched.length} news générées en ${lang}`);
    return res.status(200).json({ news: enriched });

  } catch (err) {
    console.error('[NEWS] Error:', err.message);
    return res.status(200).json({ news: [] });
  }
};
