import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly MODEL_ID = 'gemini-2.5-flash';
  // Increased timeout to fix "Request timed out" errors for complex JSON generation
  // Paleo and strict diets often require more processing time.
  private readonly TIMEOUT_MS = 60000; 

  constructor() {
    // FIX: process.env is not available in the browser.
    // TODO: Replace 'YOUR_API_KEY_HERE' with your actual Google Gemini API Key.
    // WARNING: Do not commit this key to public repositories.
    const apiKey = 'YOUR_API_KEY_HERE'; 
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (e) {
        // Fallback
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

  // Improved JSON cleaner
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

  // Sanitize data helper
  private sanitizeData(data: any): any {
    const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

    // Ensure top level arrays
    if (data.detectedIngredients) data.detectedIngredients = safeArray(data.detectedIngredients);
    if (data.detectedBeverages) data.detectedBeverages = safeArray(data.detectedBeverages);
    
    // Ensure recipe arrays
    if (data.recipes) {
      data.recipes = safeArray(data.recipes)
        .map((r: any) => ({
          ...r,
          id: r.id || this.generateId(),
          title: r.title ? r.title.split('(')[0].trim().substring(0, 50) : 'Untitled Recipe', 
          description: r.description || 'No description available.',
          difficulty: