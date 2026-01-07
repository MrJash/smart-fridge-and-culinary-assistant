import { GoogleGenAI, Type } from '@google/genai';

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

function cleanJson(text: string): string {
  if (!text) return '';
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function getRecipeSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      recipes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: 'STRICTLY MAX 6 WORDS. Name ONLY.' },
            description: { type: Type.STRING, description: 'Brief appetizing description.' },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            prepTime: { type: Type.STRING },
            calories: { type: Type.INTEGER },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  instruction: { type: Type.STRING },
                  detailedDescription: { type: Type.STRING }
                }
              }
            },
            missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            dietaryComplianceNotes: { type: Type.STRING }
          }
        }
      }
    }
  };
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

  const { ingredients, filter } = parseJsonBody(req.body);
  if (!Array.isArray(ingredients)) {
    res.status(400).json({ error: 'ingredients must be an array' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const MODEL_ID = 'gemini-2.5-flash';
  const safeFilter = typeof filter === 'string' && filter.trim() ? filter.trim() : 'None';

  try {
    const prompt = `Ingredients: ${ingredients.join(', ')}. Generate 5 recipes for ${safeFilter}. JSON ONLY.`;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: getRecipeSchema()
      }
    });

    res.status(200).json(JSON.parse(cleanJson(response.text || '')));
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gemini request failed' });
  }
}
