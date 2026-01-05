import { Component, inject, signal, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full w-full bg-slate-950">
      
      <!-- Hero Section -->
      <div class="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        
        <!-- Background Gradient -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI5M2EiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <!-- Content -->
        <div class="relative z-10 max-w-4xl mx-auto text-center">
          
          <!-- Logo -->
          <div class="inline-flex items-center justify-center gap-4 mb-8 animate-fade-in">
            <div class="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
              <span class="material-icons-round text-4xl text-emerald-400">restaurant_menu</span>
            </div>
          </div>
          
          <!-- Title -->
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-fade-in-up">
            Fridge<span class="text-emerald-400">AI</span> Chef
          </h1>
          
          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
            Transform your fridge contents into delicious recipes with the power of AI
          </p>
          
          <!-- CTA Button -->
          <button 
            (click)="getStarted()"
            class="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-semibold rounded-2xl shadow-2xl shadow-emerald-900/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-900/50 animate-fade-in-up animation-delay-200">
            <span>Get Started</span>
            <span class="material-icons-round group-hover:translate-x-1 transition-transform">arrow_forward</span>
            
            <!-- Glow effect -->
            <div class="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          </button>
          
        </div>
        
        <!-- Scroll indicator - hidden when scrolled -->
        <div 
          class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow transition-opacity duration-500"
          [class.opacity-0]="hasScrolled()"
          [class.pointer-events-none]="hasScrolled()">
          <span class="material-icons-round text-slate-500 text-3xl">expand_more</span>
        </div>
      </div>
      
      <!-- Features Section -->
      <div class="relative py-24 px-6" #featuresSection>
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950"></div>
        
        <div class="relative z-10 max-w-6xl mx-auto">
          
          <!-- Section Header -->
          <div class="text-center mb-16 scroll-animate" [class.animate-visible]="featuresVisible()">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p class="text-slate-400 max-w-xl mx-auto">Three simple steps to discover what you can cook with what you have</p>
          </div>
          
          <!-- Feature Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <!-- Feature 1 -->
            <div class="group relative bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 scroll-animate scroll-delay-1" [class.animate-visible]="featuresVisible()">
              <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="relative">
                <div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span class="material-icons-round text-3xl text-emerald-400">photo_camera</span>
                </div>
                
                <h3 class="text-xl font-bold text-white mb-3">Scan Your Fridge</h3>
                <p class="text-slate-400 leading-relaxed">
                  Take a photo of your fridge or upload an image. Our AI instantly detects all your ingredients.
                </p>
              </div>
            </div>
            
            <!-- Feature 2 -->
            <div class="group relative bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 scroll-animate scroll-delay-2" [class.animate-visible]="featuresVisible()">
              <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="relative">
                <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span class="material-icons-round text-3xl text-blue-400">auto_awesome</span>
                </div>
                
                <h3 class="text-xl font-bold text-white mb-3">AI Recipe Generation</h3>
                <p class="text-slate-400 leading-relaxed">
                  Get personalized recipe suggestions based on your ingredients, dietary preferences, and cooking skill level.
                </p>
              </div>
            </div>
            
            <!-- Feature 3 -->
            <div class="group relative bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 scroll-animate scroll-delay-3" [class.animate-visible]="featuresVisible()">
              <div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="relative">
                <div class="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span class="material-icons-round text-3xl text-amber-400">menu_book</span>
                </div>
                
                <h3 class="text-xl font-bold text-white mb-3">Step-by-Step Cooking</h3>
                <p class="text-slate-400 leading-relaxed">
                  Follow detailed instructions with an interactive cooking mode. Ask the AI chef for tips along the way!
                </p>
              </div>
            </div>
          </div>
          
          <!-- Additional Features Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div class="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 scroll-animate scroll-delay-1" [class.animate-visible]="badgesVisible()">
              <span class="material-icons-round text-emerald-400">spa</span>
              <span class="text-sm text-slate-300">Dietary Filters</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 scroll-animate scroll-delay-2" [class.animate-visible]="badgesVisible()">
              <span class="material-icons-round text-blue-400">inventory</span>
              <span class="text-sm text-slate-300">Save Profiles</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 scroll-animate scroll-delay-3" [class.animate-visible]="badgesVisible()">
              <span class="material-icons-round text-amber-400">shopping_basket</span>
              <span class="text-sm text-slate-300">Pantry List</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 scroll-animate scroll-delay-4" [class.animate-visible]="badgesVisible()">
              <span class="material-icons-round text-red-400">record_voice_over</span>
              <span class="text-sm text-slate-300">Voice Guidance</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="relative py-16 px-6 border-y border-slate-800/50">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-slate-950 to-blue-950/20"></div>
        <div class="relative z-10 max-w-5xl mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div class="scroll-animate scroll-delay-1" [class.animate-visible]="statsVisible()">
              <div class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">50+</div>
              <div class="text-slate-400 text-sm">Recipe Styles</div>
            </div>
            <div class="scroll-animate scroll-delay-2" [class.animate-visible]="statsVisible()">
              <div class="text-4xl md:text-5xl font-bold text-blue-400 mb-2">6</div>
              <div class="text-slate-400 text-sm">Dietary Filters</div>
            </div>
            <div class="scroll-animate scroll-delay-3" [class.animate-visible]="statsVisible()">
              <div class="text-4xl md:text-5xl font-bold text-amber-400 mb-2">∞</div>
              <div class="text-slate-400 text-sm">Ingredients Detected</div>
            </div>
            <div class="scroll-animate scroll-delay-4" [class.animate-visible]="statsVisible()">
              <div class="text-4xl md:text-5xl font-bold text-red-400 mb-2">AI</div>
              <div class="text-slate-400 text-sm">Powered Chef</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Demo Preview Section -->
      <div class="relative py-24 px-6">
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950"></div>
        
        <div class="relative z-10 max-w-6xl mx-auto">
          <div class="text-center mb-12 scroll-animate" [class.animate-visible]="demoVisible()">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">See It In Action</h2>
            <p class="text-slate-400 max-w-xl mx-auto">From fridge to feast in three simple steps</p>
          </div>

          <!-- Demo Steps -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            
            <!-- Step 1 -->
            <div class="scroll-animate scroll-delay-1" [class.animate-visible]="demoVisible()">
              <div class="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50 h-full">
                <div class="absolute -top-3 -left-3 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-900/50">1</div>
                
                <div class="aspect-video bg-slate-900 rounded-xl mb-4 flex items-center justify-center border border-slate-700/30 overflow-hidden">
                  <div class="relative w-full h-full flex items-center justify-center">
                    <div class="absolute inset-4 border-2 border-dashed border-emerald-500/30 rounded-lg"></div>
                    <span class="material-icons-round text-6xl text-emerald-500/50">photo_camera</span>
                  </div>
                </div>
                
                <h4 class="text-lg font-semibold text-white mb-2">Capture</h4>
                <p class="text-slate-400 text-sm">Snap a photo of your fridge contents or upload an existing image</p>
              </div>
            </div>

            <!-- Arrow -->
            <div class="hidden md:flex items-center justify-center scroll-animate scroll-delay-2" [class.animate-visible]="demoVisible()">
              <div class="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50 h-full w-full">
                <div class="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-900/50">2</div>
                
                <div class="aspect-video bg-slate-900 rounded-xl mb-4 flex items-center justify-center border border-slate-700/30 overflow-hidden">
                  <div class="flex flex-wrap gap-2 p-4 justify-center">
                    <span class="px-2 py-1 bg-emerald-900/50 text-emerald-300 rounded text-xs">Tomatoes</span>
                    <span class="px-2 py-1 bg-emerald-900/50 text-emerald-300 rounded text-xs">Cheese</span>
                    <span class="px-2 py-1 bg-emerald-900/50 text-emerald-300 rounded text-xs">Eggs</span>
                    <span class="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">Milk</span>
                    <span class="px-2 py-1 bg-emerald-900/50 text-emerald-300 rounded text-xs">Butter</span>
                    <span class="px-2 py-1 bg-emerald-900/50 text-emerald-300 rounded text-xs">Spinach</span>
                  </div>
                </div>
                
                <h4 class="text-lg font-semibold text-white mb-2">Analyze</h4>
                <p class="text-slate-400 text-sm">AI identifies all ingredients and beverages automatically</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="scroll-animate scroll-delay-3" [class.animate-visible]="demoVisible()">
              <div class="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 border border-slate-700/50 h-full">
                <div class="absolute -top-3 -left-3 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-900/50">3</div>
                
                <div class="aspect-video bg-slate-900 rounded-xl mb-4 border border-slate-700/30 overflow-hidden p-3">
                  <div class="h-full flex flex-col gap-2">
                    <div class="flex-1 bg-slate-800 rounded-lg p-2 flex items-center gap-2">
                      <div class="w-8 h-8 bg-emerald-900/50 rounded flex items-center justify-center">
                        <span class="text-emerald-400 text-xs">🍳</span>
                      </div>
                      <div class="flex-1">
                        <div class="h-2 bg-slate-700 rounded w-3/4 mb-1"></div>
                        <div class="h-1.5 bg-slate-700/50 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div class="flex-1 bg-slate-800 rounded-lg p-2 flex items-center gap-2">
                      <div class="w-8 h-8 bg-blue-900/50 rounded flex items-center justify-center">
                        <span class="text-blue-400 text-xs">🥗</span>
                      </div>
                      <div class="flex-1">
                        <div class="h-2 bg-slate-700 rounded w-2/3 mb-1"></div>
                        <div class="h-1.5 bg-slate-700/50 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 class="text-lg font-semibold text-white mb-2">Cook</h4>
                <p class="text-slate-400 text-sm">Get personalized recipes with step-by-step instructions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dietary Options Section -->
      <div class="relative py-20 px-6">
        <div class="absolute inset-0 bg-slate-900/50"></div>
        
        <div class="relative z-10 max-w-4xl mx-auto">
          <div class="text-center mb-12 scroll-animate" [class.animate-visible]="dietVisible()">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Cook Your Way</h2>
            <p class="text-slate-400 max-w-xl mx-auto">Filter recipes by your dietary preferences</p>
          </div>

          <div class="flex flex-wrap justify-center gap-4 scroll-animate scroll-delay-1" [class.animate-visible]="dietVisible()">
            <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 hover:border-emerald-500/30 transition-colors">
              <span class="material-icons-round text-emerald-400">lunch_dining</span>
              <span class="text-white font-medium">Everything</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 hover:border-green-500/30 transition-colors">
              <span class="material-icons-round text-green-400">spa</span>
              <span class="text-white font-medium">Vegetarian</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 hover:border-lime-500/30 transition-colors">
              <span class="material-icons-round text-lime-400">eco</span>
              <span class="text-white font-medium">Vegan</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 hover:border-orange-500/30 transition-colors">
              <span class="material-icons-round text-orange-400">fitness_center</span>
              <span class="text-white font-medium">Keto</span>
            </div>
            <div class="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 hover:border-yellow-500/30 transition-colors">
              <span class="material-icons-round text-yellow-400">grain</span>
              <span class="text-white font-medium">Gluten Free</span>
            </div>

          </div>
        </div>
      </div>
      
      <!-- Bottom CTA -->
      <div class="relative py-20 px-6">
        <div class="relative z-10 max-w-2xl mx-auto text-center scroll-animate" [class.animate-visible]="ctaVisible()">
          <h2 class="text-3xl font-bold text-white mb-6">Ready to Cook?</h2>
          <p class="text-slate-400 mb-8">Start scanning your fridge and discover delicious recipes in seconds.</p>
          
          <button 
            (click)="getStarted()"
            class="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white text-lg font-semibold rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
            <span class="material-icons-round text-emerald-400">restaurant_menu</span>
            <span>Open FridgeAI</span>
          </button>
        </div>
      </div>
      
      <!-- Footer -->
      <footer class="border-t border-slate-800 py-8 px-6">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-slate-500">
            <span class="material-icons-round text-emerald-500">restaurant_menu</span>
            <span class="font-semibold text-slate-400">FridgeAI Chef</span>
          </div>
          <p class="text-sm text-slate-600">Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out backwards;
    }
    
    .animation-delay-100 {
      animation-delay: 0.1s;
    }
    
    .animation-delay-200 {
      animation-delay: 0.2s;
    }
    
    .animate-bounce-slow {
      animation: bounceSlow 2s infinite;
    }
    
    /* Scroll-triggered animations */
    .scroll-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-animate.animate-visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .scroll-delay-1 { transition-delay: 0.1s; }
    .scroll-delay-2 { transition-delay: 0.2s; }
    .scroll-delay-3 { transition-delay: 0.3s; }
    .scroll-delay-4 { transition-delay: 0.4s; }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    @keyframes bounceSlow {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(8px); }
    }
  `],
  host: {
    class: 'block h-screen overflow-y-auto',
    '(scroll)': 'onScroll($event)'
  }
})
export class LandingComponent {
  store = inject(StoreService);
  private el = inject(ElementRef);
  
  // Scroll state
  hasScrolled = signal(false);
  featuresVisible = signal(false);
  badgesVisible = signal(false);
  statsVisible = signal(false);
  demoVisible = signal(false);
  dietVisible = signal(false);
  ctaVisible = signal(false);

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const viewportHeight = element.clientHeight;
    
    // Hide scroll indicator after scrolling 50px
    this.hasScrolled.set(scrollTop > 50);
    
    // Trigger features animation when section is in view
    const featuresThreshold = viewportHeight * 0.5;
    this.featuresVisible.set(scrollTop > featuresThreshold - 200);
    
    // Trigger badges animation
    const badgesThreshold = viewportHeight * 0.8;
    this.badgesVisible.set(scrollTop > badgesThreshold);
    
    // Trigger stats animation
    const statsThreshold = viewportHeight * 1.0;
    this.statsVisible.set(scrollTop > statsThreshold);
    
    // Trigger demo animation
    const demoThreshold = viewportHeight * 1.3;
    this.demoVisible.set(scrollTop > demoThreshold);
    
    // Trigger diet options animation
    const dietThreshold = viewportHeight * 1.8;
    this.dietVisible.set(scrollTop > dietThreshold);
    
    // Trigger CTA animation
    const ctaThreshold = viewportHeight * 2.2;
    this.ctaVisible.set(scrollTop > ctaThreshold);
  }

  getStarted() {
    this.store.setView('camera');
  }
}
