import { GoogleGenAI } from '@google/genai';

function getApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY
  );
}

function parseJsonBody(body: any): any {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(500).json({ error: 'Server Gemini API key is missing. Set GEMINI_API_KEY in Vercel.' });
    return;
  }

  const { recipeContext, userQuestion } = parseJsonBody(req.body);
  if (!userQuestion || typeof userQuestion !== 'string') {
    res.status(400).json({ error: 'userQuestion is required' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const MODEL_ID = 'gemini-2.5-flash';

  const title = recipeContext?.title ? String(recipeContext.title) : 'Recipe';
  const prompt = `Recipe: ${title}. Question: ${userQuestion}. Reply briefly.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt
    });

    res.status(200).json({ text: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gemini request failed' });
  }
}
