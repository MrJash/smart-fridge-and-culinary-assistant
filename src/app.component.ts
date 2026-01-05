import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './services/store.service';
import { CameraComponent } from './components/camera.component';
import { RecipeListComponent } from './components/recipe-list.component';
import { CookingModeComponent } from './components/cooking-mode.component';
import { ShoppingListComponent } from './components/shopping-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CameraComponent, 
    RecipeListComponent, 
    CookingModeComponent,
    ShoppingListComponent
  ],
  templateUrl: './app.component.html',
  styles: [`
    :host { display: block; height: 100%; }
    
    .animate-slide-right { animation: slideRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
    @keyframes slideRight { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .animate-spin-reverse { animation: spinReverse 3s linear infinite; }
    @keyframes spinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

    .animate-bounce-slight { animation: bounceSlight 2s infinite; }
    @keyframes bounceSlight { 
      0%, 100% { transform: translateY(0); } 
      50% { transform: translateY(-5px); } 
    }

    .animate-slide-down { animation: slideDown 0.3s ease-out; }
    @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
  `]
})
export class AppComponent {
  store = inject(StoreService);
  showShoppingList = false; // Hidden by default now for cleaner initial view

  filters = [
    { id: 'None', label: 'Everything', icon: 'lunch_dining' },
    { id: 'Vegetarian', label: 'Vegetarian', icon: 'spa' },
    { id: 'Vegan', label: 'Vegan', icon: 'eco' },
    { id: 'Keto', label: 'Keto', icon: 'fitness_center' },
    { id: 'Gluten Free', label: 'Gluten Free', icon: 'grain' },
    { id: 'Paleo', label: 'Paleo', icon: 'restaurant' }
  ];

  toggleShoppingList() {
    this.showShoppingList = !this.showShoppingList;
  }
}