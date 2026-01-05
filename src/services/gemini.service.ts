import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly MODEL_ID = 'gemini-2.5-flash';
  private readonly TIMEOUT_MS = 60000; 

constructor() {
    const apiKey = environment.geminiApiKey;
    
    if (!apiKey) {
      console.error('Gemini API Key is missing! Check your environment configuration.');
    }
    
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
}

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (e) {
      }
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private getRecipeSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        recipes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "STRICTLY MAX 6 WORDS. Name ONLY." },
              description: { type: Type.STRING, description: "Brief appetizing description." },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              prepTime: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              steps: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING, description: "The core action (e.g., 'Chop the onions')." },
                    detailedDescription: { type: Type.STRING, description: "A detailed paragraph (3-4 sentences) explaining exactly HOW to do it, visual cues to look for, and technical reasoning. NOT a tip box." }
                  }
                } 
              },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Must include dietary tags if applicable: 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten Free'."
              },
              dietaryComplianceNotes: { type: Type.STRING }
            }
          }
        }
      }
    };
  }

  private cleanJson(text: string): string {
    if (!text) return '';
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }

  private sanitizeData(data: any): any {
    const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

    if (data.detectedIngredients) data.detectedIngredients = safeArray(data.detectedIngredients);
    if (data.detectedBeverages) data.detectedBeverages = safeArray(data.detectedBeverages);
    if (data.recipes) {
      data.recipes = safeArray(data.recipes)
        .map((r: any) => ({
          ...r,
          id: r.id || this.generateId(),
          title: r.title ? r.title.split('(')[0].trim().substring(0, 50) : 'Untitled Recipe', 
          description: r.description || 'No description available.',
          difficulty: r.difficulty || 'Medium',
        prepTime: r.prepTime || '15 min',
        calories: Number(r.calories) || 0,
        steps: safeArray(r.steps).map((s: any) => ({
          instruction: s.instruction || 'Step',
          detailedDescription: s.detailedDescription || 'No details.'
        })),
        missingIngredients: safeArray(r.missingIngredients),
        tags: safeArray(r.tags)
      }));
    }
    return data;
  }

  async analyzeFridge(imageBase64: string, filter: string = 'None'): Promise<any> {
    const prompt = `Analyze this fridge image. Identify ingredients and suggest 6-8 recipes for ${filter} diet. JSON ONLY.`;
    const response = await this.ai.models.generateContent({
      model: this.MODEL_ID,
      contents: {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            detectedBeverages: { type: Type.ARRAY, items: { type: Type.STRING } },
            recipes: (this.getRecipeSchema() as any).properties.recipes
          }
        }
      }
    });
    const parsed = JSON.parse(this.cleanJson(response.text));
    return this.sanitizeData(parsed);
  }

  async suggestRecipesFromIngredients(ingredients: string[], filter: string): Promise<any> {
    const prompt = `Ingredients: ${ingredients.join(', ')}. Generate 5 recipes for ${filter}. JSON ONLY.`;
    const response = await this.ai.models.generateContent({
      model: this.MODEL_ID,
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: this.getRecipeSchema()
      }
    });
    return this.sanitizeData(JSON.parse(this.cleanJson(response.text)));
  }

  async askChef(recipeContext: any, userQuestion: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.MODEL_ID,
      contents: `Recipe: ${recipeContext.title}. Question: ${userQuestion}. Reply briefly.`,
    });
    return response.text;
  }
}