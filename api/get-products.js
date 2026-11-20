import Groq from 'groq-sdk';

export default async function handler(req, res) {
  const category = req.query.category;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const rainforestKey = process.env.RAINFOREST_API_KEY;
  
  try {
    // 1. Get the text data from Groq
    const prompt = `Write a tech blog listicle for the top 10 ${category}. 
    Return ONLY a JSON array with this exact format, no markdown formatting: 
    [{
      "name": "Product Name", 
      "award": "Best overall",
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

    // 2. Fetch real images from Rainforest API concurrently
    const productsWithImages = await Promise.all(products.map(async (product) => {
      try {
        const url = `https://api.rainforestapi.com/request?api_key=${rainforestKey}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(product.name)}`;
        const imageReq = await fetch(url);
        const imageData = await imageReq.json();
        
        // Grab the official Amazon image of the top search result
        const imageUrl = imageData.search_results?.[0]?.image || `https://placehold.co/800x400/eeeeee/333333?text=${encodeURIComponent(product.name)}`;
        
        return { ...product, imageUrl };
      } catch (imgError) {
        // If Rainforest fails for this specific item, use a safe placeholder
        return { ...product, imageUrl: `https://placehold.co/800x400/eeeeee/333333?text=${encodeURIComponent(product.name)}` };
      }
    }));

    // 3. Send the combined data to Angular
    res.status(200).json(productsWithImages);

  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}