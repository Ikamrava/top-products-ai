import Groq from 'groq-sdk';

export default async function handler(req, res) {
  const category = req.query.category;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  try {
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

    res.status(200).json(products);

  } catch (error) {
    console.error("Backend error:", error); // This logs to the Vercel console
    res.status(500).json({ error: "Failed to fetch data" });
  }
}