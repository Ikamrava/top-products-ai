import Groq from 'groq-sdk';

try {
  process.loadEnvFile('.env.local');
} catch (e) {
  // Ignore on Vercel production where env vars are injected automatically
}

export default async function handler(req, res) {
  const category = req.query.category;

  if (!category) {
    return res.status(400).json({ error: 'Category parameter is required' });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const rainforestKey = process.env.RAINFOREST_API_KEY;

  try {
    // 1. Get the text data from Groq with UNIQUE awards
    const prompt = `Write a tech blog listicle for the top 10 ${category}. 
    Give each product a UNIQUE award title (e.g. "Best overall", "Best value", "Best camera", "Best battery life", "Best budget pick").
    Return ONLY a JSON array with this exact format, no markdown formatting: 
    [{
      "name": "Product Name", 
      "award": "Unique Award Title",
      "description": "A detailed 3-sentence review explaining why it is great.",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"]
    }]`;

    const aiResponse = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-20b',
    });

    const rawText = aiResponse.choices[0]?.message?.content || '[]';
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const products = JSON.parse(cleanJson);

    // 2. Fetch high-res images from Rainforest API concurrently
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        try {
          const url = `https://api.rainforestapi.com/request?api_key=${rainforestKey}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(product.name)}`;
          const imageReq = await fetch(url);
          const imageData = await imageReq.json();

          let imageUrl =
            imageData.search_results?.[0]?.image ||
            `https://placehold.co/600x400/f3f4f6/374151?text=${encodeURIComponent(product.name)}`;

          // Strip Amazon's thumbnail size constraint to get the crisp, high-res image
          imageUrl = imageUrl.replace(/\._AC_.*_\./, '.');

          return { ...product, imageUrl };
        } catch (imgError) {
          return {
            ...product,
            imageUrl: `https://placehold.co/600x400/f3f4f6/374151?text=${encodeURIComponent(product.name)}`,
          };
        }
      })
    );

    // 3. Send the combined data to Angular
    return res.status(200).json(productsWithImages);
  } catch (error) {
    console.error('Backend error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}