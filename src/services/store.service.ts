import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { GeminiService } from './gemini.service';

export interface RecipeStep {
  instruction: string;
  detailedDescription: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  calories: number;
  steps: RecipeStep[];
  missingIngredients: string[];
  tags: string[];
  dietaryComplianceNotes?: string;
}

export interface AnalysisResult {
  detectedIngredients: string[];
  detectedBeverages: string[];
  recipes: Recipe[];
}

export interface FridgeProfile {
  id: string;
  slotId: number; // 1, 2, or 3
  name: string;
  createdAt: number;
  data: AnalysisResult;
  dietaryFilter: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private geminiService = inject(GeminiService);

  // State
  readonly currentView = signal<'camera' | 'dashboard' | 'cooking'>('camera');
  
  // Holds the raw API response (all recipes)
  readonly analysisResult = signal<AnalysisResult | null>(null);
  
  readonly selectedRecipe = signal<Recipe | null>(null);
  
  // Shopping List
  readonly shoppingList = signal<string[]>(this.loadShoppingList());
  
  // Profiles
  readonly savedProfiles = signal<FridgeProfile[]>(this.loadProfiles());

  readonly dietaryFilter = signal<string>('None');
  
  // Computed: Client-side filtering
  readonly filteredRecipes = computed(() => {
    const result = this.analysisResult();
    const filter = this.dietaryFilter();

    if (!result || !result.recipes) return [];
    
    if (filter === 'None') {
      return result.recipes;
    }

    // Filter based on tags or AI notes
    return result.recipes.filter(recipe => {
      const tags = (recipe.tags || []).map(t => t.toLowerCase());
      const notes = (recipe.dietaryComplianceNotes || '').toLowerCase();
      const target = filter.toLowerCase();
      
      return tags.includes(target) || notes.includes(target);
    });
  });

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  constructor() {
    // Automatically save shopping list whenever it changes
    effect(() => {
      this.saveShoppingList(this.shoppingList());
    });

    // Automatically save profiles whenever they change
    effect(() => {
      this.saveProfilesToStorage(this.savedProfiles());
    });
  }

  // --- Helpers ---
  
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

  // --- Storage Helpers ---

  private loadShoppingList(): string[] {
    try {
      const stored = localStorage.getItem('pantry_list');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveShoppingList(list: string[]) {
    localStorage.setItem('pantry_list', JSON.stringify(list));
  }

  private loadProfiles(): FridgeProfile[] {
    try {
      const stored = localStorage.getItem('fridge_profiles');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveProfilesToStorage(profiles: FridgeProfile[]) {
    localStorage.setItem('fridge_profiles', JSON.stringify(profiles));
  }

  // --- Actions ---

  setView(view: 'camera' | 'dashboard' | 'cooking') {
    this.currentView.set(view);
  }

  setAnalysisResult(result: AnalysisResult) {
    this.analysisResult.set(result);
  }

  setSelectedRecipe(recipe: Recipe) {
    this.selectedRecipe.set(recipe);
  }

  addToShoppingList(item: string) {
    this.shoppingList.update(list => {
      if (!list.some(i => i.toLowerCase() === item.toLowerCase())) {
        this.showSuccess(`Added ${item} to pantry`);
        return [...list, item];
      }
      return list;
    });
  }

  removeFromShoppingList(item: string) {
    this.shoppingList.update(list => list.filter(i => i !== item));
  }

  setDietaryFilter(filter: string) {
    // Just update the signal. The 'filteredRecipes' computed will handle the view update.
    // No API call needed unless the list is completely empty, which we handle manually if needed.
    this.dietaryFilter.set(filter);
  }

  // --- Profile Actions ---

  saveProfileToSlot(slotId: number, name: string) {
    const currentData = this.analysisResult();
    if (!currentData) {
      this.setError("No fridge data to save!");
      return;
    }

    const newProfile: FridgeProfile = {
      id: this.generateId(),
      slotId: Number(slotId), // Ensure number
      name,
      createdAt: Date.now(),
      data: currentData,
      dietaryFilter: this.dietaryFilter()
    };

    this.savedProfiles.update(profiles => {
      // Remove any existing profile in this slot
      const filtered = profiles.filter(p => p.slotId != slotId);
      return [...filtered, newProfile];
    });
    
    this.showSuccess(`Saved to Slot ${slotId}`);
  }

  renameProfile(slotId: number, newName: string) {
    this.savedProfiles.update(profiles => 
      // Use loose equality to be safe against string/number mismatches in storage
      profiles.map(p => p.slotId == slotId ? { ...p, name: newName } : p)
    );
    this.showSuccess("Profile updated");
  }

  loadProfile(profile: FridgeProfile) {
    this.analysisResult.set(profile.data);
    this.dietaryFilter.set(profile.dietaryFilter);
    this.setView('dashboard');
    this.showSuccess(`Loaded ${profile.name}`);
  }

  deleteProfile(slotId: number) {
    this.savedProfiles.update(profiles => profiles.filter(p => p.slotId != slotId));
    this.showSuccess(`Slot ${slotId} cleared`);
  }

  // --- Async Logic ---

  async regenerateRecipes(ingredients: string[], filter: string) {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await this.geminiService.suggestRecipesFromIngredients(ingredients, filter);
      
      this.analysisResult.update(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recipes: data.recipes || []
        };
      });
    } catch (err: any) {
      console.error('Failed to regenerate recipes:', err);
      let msg = "Something went wrong. Please try again.";
      if (err.message?.includes('timed out')) {
        msg = "The chef is taking too long to think. Please try again or switch filters.";
      } else if (err.message?.includes('Gemini')) {
         msg = "Unable to contact the chef. Please check your connection.";
      }
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

  setLoading(loading: boolean) {
    this.isLoading.set(loading);
    if (loading) this.error.set(null);
  }

  setError(msg: string | null) {
    this.error.set(msg);
  }
  
  showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => {
      // Only clear if it hasn't been replaced
      if (this.successMessage() === msg) {
        this.successMessage.set(null);
      }
    }, 3000);
  }

  reset() {
    this.analysisResult.set(null);
    this.selectedRecipe.set(null);
    this.error.set(null);
    this.dietaryFilter.set('None');
    this.setView('camera');
  }
}