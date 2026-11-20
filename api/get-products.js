import Groq from 'groq-sdk';

// This runs on a secure Vercel server, NOT in the user's browser!
export default async function handler(req, res) {
  const category = req.query.category;
  
  // 1. Your keys are hidden safely in Vercel's Environment Variables
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const imageApiKey = process.env.IMAGE_SEARCH_API_KEY; // e.g., SerpApi or Rainforest
  
  try {
    // 2. Get the text from Groq
    const aiResponse = await groq.chat.completions.create({
      messages: [{ role: 'user', content: `Top 10 ${category} as JSON array...` }],
      model: 'openai/gpt-oss-20b', 
    });
    const products = JSON.parse(aiResponse.choices[0].message.content);

    // 3. Loop through products and ask the Image API for the real photo
    const productsWithImages = await Promise.all(products.map(async (product) => {
      // Example: Fetching from a secure third-party image API
      const imageReq = await fetch(`https://api.some-image-service.com/search?q=${product.name}&api_key=${imageApiKey}`);
      const imageData = await imageReq.json();
      
      return { ...product, imageUrl: imageData.top_result_image };
    }));

    // 4. Send the final, beautiful data down to Angular
    res.status(200).json(productsWithImages);

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}