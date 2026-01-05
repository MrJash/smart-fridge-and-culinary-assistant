import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Recipe } from '../services/store.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-slate-950 animate-fade-in relative">
      
      <!-- Top Bar: Ingredients & Status -->
      <div class="p-6 md:p-8 pb-5 bg-gradient-to-b from-slate-900 to-slate-950 z-10 sticky top-0 shrink-0">
        <!-- Header Row -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 class="text-3xl font-bold text-white tracking-tight mb-1">Your Fridge</h2>
            <div class="flex items-center gap-3 text-sm">
              <span class="text-slate-400">
                <span class="text-emerald-400 font-bold">{{ store.analysisResult()?.detectedIngredients?.length || 0 }}</span> ingredients detected
              </span>
              <span class="w-1 h-1 rounded-full bg-slate-600"></span>
              <span class="text-slate-400">
                Filter: <span class="text-emerald-400 font-semibold">{{ store.dietaryFilter() === 'None' ? 'All' : store.dietaryFilter() }}</span>
              </span>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button (click)="openManageModal()" class="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-slate-700 hover:border-emerald-500/30">
              <span class="material-icons-round text-lg">inventory</span> 
              <span class="hidden sm:inline">Manage</span>
            </button>
            <button (click)="store.reset()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 border border-slate-700 hover:border-slate-600">
              <span class="material-icons-round text-lg">cameraswitch</span> 
              <span class="hidden sm:inline">Rescan</span>
            </button>
          </div>
        </div>

        <!-- Separator -->
        <div class="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-5"></div>

        <!-- Detected Chips -->
        <div class="flex flex-wrap gap-2 max-h-28 overflow-y-auto custom-scroll pr-2">
          @for (ing of store.analysisResult()?.detectedIngredients; track ing) {
            <span class="px-3 py-1.5 bg-slate-800/80 text-slate-300 rounded-full text-xs font-medium border border-slate-700/50 hover:border-emerald-500/30 transition-colors cursor-default">{{ ing }}</span>
          }
          @for (bev of store.analysisResult()?.detectedBeverages; track bev) {
            <span class="px-3 py-1.5 bg-blue-950/50 text-blue-300 rounded-full text-xs font-medium border border-blue-800/50 hover:border-blue-500/30 transition-colors cursor-default flex items-center gap-1">
              <span class="material-icons-round text-xs">local_drink</span>{{ bev }}
            </span>
          }
        </div>
      </div>

      <!-- Separator Line -->
      <div class="h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"></div>

      <!-- Recipes Grid -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scroll">
        
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 bg-emerald-500 rounded-full"></div>
            <h3 class="text-xl font-bold text-white">Suggested Recipes</h3>
            <span class="text-sm text-slate-500">({{ store.filteredRecipes().length }})</span>
          </div>
          @if (store.isLoading()) {
            <div class="flex items-center gap-2 text-emerald-400 text-sm animate-pulse">
              <span class="material-icons-round text-base animate-spin">refresh</span> Updating...
            </div>
          }
        </div>
        
        <!-- Empty State for No Recipes -->
        @if (!store.isLoading() && store.filteredRecipes().length === 0) {
           <div class="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <span class="material-icons-round text-4xl text-slate-500">no_food</span>
              </div>
              <h4 class="text-xl font-bold text-white mb-2">No {{ store.dietaryFilter() }} Recipes Found</h4>
              <p class="text-slate-400 max-w-md mx-auto mb-6">
                None of the suggested recipes match the 
                <span class="text-emerald-400 font-bold">{{ store.dietaryFilter() }}</span> filter.
              </p>
              <div class="flex gap-4">
                <button (click)="store.setDietaryFilter('None')" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition flex items-center gap-2">
                    <span class="material-icons-round">filter_alt_off</span> Clear Filter
                </button>
                <button (click)="forceGenerate()" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition flex items-center gap-2">
                    <span class="material-icons-round">autorenew</span> Generate {{ store.dietaryFilter() }} Recipes
                </button>
              </div>
           </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          @for (recipe of store.filteredRecipes(); track recipe.id) {
            <div (click)="selectRecipe(recipe)" class="group relative bg-slate-900 rounded-2xl overflow-hidden hover:bg-slate-800 transition-all duration-300 cursor-pointer border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1">
              
              <!-- Content -->
              <div class="p-6 flex flex-col h-full">
                <!-- Header -->
                <div class="flex justify-between items-start mb-3">
                   <span class="px-2 py-1 rounded-md bg-slate-950 text-xs font-bold tracking-wide" 
                         [class.text-emerald-400]="recipe.difficulty === 'Easy'"
                         [class.text-amber-400]="recipe.difficulty === 'Medium'"
                         [class.text-red-400]="recipe.difficulty === 'Hard'">
                     {{ recipe.difficulty }}
                   </span>
                   <span class="text-xs text-slate-500 font-medium">{{ recipe.prepTime }}</span>
                </div>

                <h4 class="font-bold text-xl text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">{{ recipe.title }}</h4>
                <p class="text-slate-400 text-sm line-clamp-3 mb-4 flex-1">{{ recipe.description }}</p>
                
                <!-- Tags Row -->
                @if (recipe.tags && recipe.tags.length > 0) {
                    <div class="flex flex-wrap gap-1 mb-4">
                        @for (tag of recipe.tags.slice(0, 3); track tag) {
                            <span class="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700">{{tag}}</span>
                        }
                    </div>
                }

                <!-- Footer Stats -->
                <div class="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-800 group-hover:border-slate-700 transition-colors">
                  <span class="flex items-center gap-1"><span class="material-icons-round text-base text-orange-500">local_fire_department</span> {{ recipe.calories }} kcal</span>
                  <span class="flex items-center gap-1"><span class="material-icons-round text-base text-blue-500">menu_book</span> {{ recipe.steps?.length || 0 }} steps</span>
                </div>

                <!-- Missing Ingredients -->
                @if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
                  <div class="mt-4">
                    <p class="text-[10px] text-red-300/80 mb-2 uppercase tracking-wider font-bold">Missing:</p>
                    <div class="flex flex-wrap gap-1.5">
                      @for (missing of recipe.missingIngredients; track missing) {
                        <button 
                          (click)="addIngredient($event, missing)" 
                          class="flex items-center gap-1 px-2 py-1 bg-red-950/30 text-red-300 rounded text-[10px] hover:bg-red-900/50 transition border border-red-900/20 active:scale-95">
                          <span class="material-icons-round text-[10px]">add</span> {{ missing }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Manage Fridge Modal -->
      @if (showManageModal) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div (click)="closeManageModal()" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"></div>
          
          <!-- Modal Content -->
          <div class="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-slide-up">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <span class="material-icons-round text-emerald-400">kitchen</span> Manage Fridge Profiles
              </h3>
              <button (click)="closeManageModal()" class="text-slate-400 hover:text-white transition">
                <span class="material-icons-round">close</span>
              </button>
            </div>

            <div class="space-y-4">
              @for (slot of slots; track slot) {
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                  <!-- Left Side: Status -->
                  <div class="flex items-center gap-4 min-w-0">
                    <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm"
                         [class]="getProfileForSlot(slot) ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-500'">
                      {{ slot }}
                    </div>
                    <div class="min-w-0 flex-1">
                      @if (getProfileForSlot(slot); as profile) {
                        <h4 class="font-bold text-white truncate pr-2">{{ profile.name }}</h4>
                        <p class="text-xs text-slate-400 truncate">{{ profile.createdAt | date:'mediumDate' }} • {{ profile.dietaryFilter }}</p>
                      } @else {
                        <h4 class="font-medium text-slate-400 italic">Empty Slot</h4>
                      }
                    </div>
                  </div>

                  <!-- Right Side: Actions -->
                  <div class="flex items-center gap-2 shrink-0">
                    @if (getProfileForSlot(slot); as profile) {
                      <button (click)="loadSlot($event, profile)" class="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition" title="Load">
                        <span class="material-icons-round text-lg">upload</span>
                      </button>
                      <button (click)="renameSlot($event, slot, profile.name)" class="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition" title="Rename">
                        <span class="material-icons-round text-lg">edit</span>
                      </button>
                      <button (click)="saveToSlot($event, slot)" class="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition" title="Overwrite">
                        <span class="material-icons-round text-lg">save</span>
                      </button>
                      <button (click)="deleteSlot($event, slot)" class="p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/50 transition" title="Clear">
                        <span class="material-icons-round text-lg">delete</span>
                      </button>
                    } @else {
                      <button (click)="saveToSlot($event, slot)" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                        <span class="material-icons-round text-sm">save</span> Save
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <p class="text-center text-xs text-slate-500 mt-6">
              Save up to 3 fridge snapshots to quickly reload recipes later.
            </p>
          </div>
        </div>
      }

      <!-- Rename Modal -->
      @if (showRenameModal()) {
        <div class="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div (click)="cancelRename()" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"></div>
          <div class="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-slide-up">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span class="material-icons-round text-blue-400">edit</span> Rename Profile
            </h3>
            <input 
              type="text" 
              [(ngModel)]="renameInputValue"
              maxlength="20"
              placeholder="Enter new name"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition mb-4"
              (keydown.enter)="confirmRename()"
              autofocus>
            <div class="flex gap-3">
              <button (click)="cancelRename()" class="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition">
                Cancel
              </button>
              <button (click)="confirmRename()" class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition">
                Rename
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div (click)="cancelDelete()" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in"></div>
          <div class="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-slide-up">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                <span class="material-icons-round text-red-400 text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Clear Slot {{ deleteSlotId() }}?</h3>
                <p class="text-sm text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="cancelDelete()" class="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition">
                Cancel
              </button>
              <button (click)="confirmDelete()" class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow: hidden; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .custom-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  `]
})
export class RecipeListComponent {
  store = inject(StoreService);
  
  showManageModal = false;
  slots = [1, 2, 3];

  // Rename modal state
  showRenameModal = signal(false);
  renameSlotId = signal<number>(0);
  renameInputValue = '';

  // Delete modal state
  showDeleteModal = signal(false);
  deleteSlotId = signal<number>(0);

  selectRecipe(recipe: Recipe) {
    this.store.setSelectedRecipe(recipe);
    this.store.setView('cooking');
  }

  addIngredient(event: Event, item: string) {
    event.stopPropagation();
    this.store.addToShoppingList(item);
  }

  forceGenerate() {
    const ingredients = this.store.analysisResult()?.detectedIngredients || [];
    this.store.regenerateRecipes(ingredients, this.store.dietaryFilter());
  }

  // --- Modal Logic ---

  openManageModal() {
    this.showManageModal = true;
  }

  closeManageModal() {
    this.showManageModal = false;
  }

  getProfileForSlot(slot: number) {
    // Loose equality for safety with storage data
    return this.store.savedProfiles().find(p => p.slotId == slot);
  }

  saveToSlot(event: Event, slot: number) {
    event.stopPropagation();
    // Generate an automatic name to bypass blocking prompts for saving
    const date = new Date();
    // E.g. "Fridge Oct 24 • 14:30"
    const name = `Fridge ${date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} • ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    // Save immediately
    this.store.saveProfileToSlot(slot, name);
  }

  // --- Rename Modal Logic ---
  renameSlot(event: Event, slot: number, currentName: string) {
    event.stopPropagation();
    this.renameSlotId.set(slot);
    this.renameInputValue = currentName;
    this.showRenameModal.set(true);
  }

  confirmRename() {
    let newName = this.renameInputValue.trim();
    if (newName.length > 20) {
      newName = newName.substring(0, 20);
    }
    if (newName.length === 0) {
      newName = "Untitled Fridge";
    }
    this.store.renameProfile(this.renameSlotId(), newName);
    this.showRenameModal.set(false);
  }

  cancelRename() {
    this.showRenameModal.set(false);
  }

  loadSlot(event: Event, profile: any) {
    event.stopPropagation();
    this.store.loadProfile(profile);
    this.closeManageModal();
  }

  // --- Delete Modal Logic ---
  deleteSlot(event: Event, slot: number) {
    event.stopPropagation();
    this.deleteSlotId.set(slot);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    this.store.deleteProfile(this.deleteSlotId());
    this.showDeleteModal.set(false);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
  }
}