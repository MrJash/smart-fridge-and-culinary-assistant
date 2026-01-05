import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50">
      <!-- Header -->
      <div class="p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <span class="material-icons-round text-emerald-400">shopping_basket</span> Pantry
        </h3>
        <span class="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
          {{ store.shoppingList().length }} items
        </span>
      </div>
      
      <!-- Input -->
      <div class="p-4 bg-slate-800/50">
        <div class="flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="newItem" 
            (keydown.enter)="addItem()"
            placeholder="Add item..." 
            class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
          <button (click)="addItem()" class="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 transition-colors">
            <span class="material-icons-round text-lg">add</span>
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        @if (store.shoppingList().length === 0) {
          <div class="flex flex-col items-center justify-center h-48 text-slate-500 opacity-60">
            <span class="material-icons-round text-4xl mb-2">remove_shopping_cart</span>
            <p class="text-sm">Your list is empty.</p>
          </div>
        }
        
        @for (item of store.shoppingList(); track item) {
          <div class="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg group hover:bg-slate-800 transition-colors animate-slide-in">
            <!-- Custom Checkbox appearance -->
             <button class="w-5 h-5 rounded border border-slate-500 hover:border-emerald-400 flex items-center justify-center text-transparent hover:text-emerald-400 transition-all" (click)="removeItem(item)">
                <span class="material-icons-round text-sm">check</span>
             </button>

            <span class="text-slate-200 text-sm font-medium flex-1">{{ item }}</span>
            
            <button (click)="removeItem(item)" class="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
              <span class="material-icons-round text-lg">close</span>
            </button>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-slate-800">
        <button (click)="shareList()" class="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-200 transition flex justify-center items-center gap-2 border border-slate-700">
          <span class="material-icons-round text-sm">ios_share</span> Export List
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-in { animation: slideIn 0.2s cubic-bezier(0.2, 0, 0.2, 1); }
    @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class ShoppingListComponent {
  store = inject(StoreService);
  newItem = '';

  addItem() {
    if (this.newItem.trim()) {
      this.store.addToShoppingList(this.newItem.trim());
      this.newItem = '';
    }
  }

  removeItem(item: string) {
    // Small delay to simulate "checking off"
    this.store.removeFromShoppingList(item);
  }

  shareList() {
    const text = "Groceries needed:\n" + this.store.shoppingList().map(i => `[ ] ${i}`).join('\n');
    if (navigator.share) {
      navigator.share({ title: 'FridgeAI Shopping List', text: text });
    } else {
      navigator.clipboard.writeText(text);
      alert('List copied to clipboard!');
    }
  }
}