import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-full w-full p-4 relative animate-fade-in overflow-y-auto">
      
      <!-- Instructions overlay -->
      <div class="text-center z-10 mb-6 mt-12 md:mt-0">
        <h2 class="text-3xl font-light text-white drop-shadow-lg tracking-wide">Scan Your Fridge</h2>
        <p class="text-slate-300 text-sm mt-1 drop-shadow-md">We'll find the ingredients for you.</p>
      </div>

      <!-- Camera/Upload Viewfinder -->
      <div class="relative w-full max-w-lg aspect-[3/4] md:aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 group shrink-0">
        
        <!-- Video Element -->
        <video #videoRef autoplay playsinline class="absolute inset-0 w-full h-full object-cover hidden" [class.block]="isStreamActive()"></video>
        
        <!-- Upload Placeholder -->
        <div *ngIf="!isStreamActive()" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-800/40">
           <div class="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mb-6 ring-4 ring-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
             <span class="material-icons-round text-5xl text-emerald-400">add_a_photo</span>
           </div>
           <p class="text-lg font-medium text-slate-300">Tap to start</p>
        </div>

        <!-- Scanning Overlay (Decorative) -->
        <div *ngIf="isStreamActive()" class="absolute inset-0 pointer-events-none border-[1px] border-emerald-500/30 m-4 rounded-2xl">
          <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg"></div>
          <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg"></div>
          <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg"></div>
          <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg"></div>
          
          <!-- Scan Line Animation -->
          <div class="absolute left-0 right-0 h-0.5 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan"></div>
        </div>

        <!-- Hidden File Input -->
        <input type="file" accept="image/*" capture="environment" (change)="onFileSelected($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" [disabled]="isStreamActive()">
      </div>

      <!-- Controls -->
      <div class="mt-8 flex gap-6 z-20 mb-8">
        @if (!isStreamActive()) {
          <button (click)="startCamera()" class="flex flex-col items-center gap-2 group">
             <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-slate-700 transition-all shadow-lg">
                <span class="material-icons-round text-2xl text-white">videocam</span>
             </div>
             <span class="text-xs font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">Camera</span>
          </button>

          <label class="flex flex-col items-center gap-2 group cursor-pointer">
             <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-slate-700 transition-all shadow-lg">
                <span class="material-icons-round text-2xl text-white">upload_file</span>
             </div>
             <span class="text-xs font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">Upload</span>
             <input type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden">
          </label>
        } @else {
          <!-- Shutter Button -->
          <button (click)="captureImage()" class="relative w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center transition-transform active:scale-95">
             <div class="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
          </button>
          
           <button (click)="stopCamera()" class="absolute bottom-8 right-8 p-3 rounded-full bg-slate-800/80 text-white backdrop-blur-md border border-slate-700 hover:bg-slate-700 transition">
            <span class="material-icons-round">close</span>
          </button>
        }
      </div>

      <!-- Saved Profiles Section -->
      @if (!isStreamActive() && store.savedProfiles().length > 0) {
        <div class="w-full max-w-lg mb-8 animate-fade-in border-t border-slate-800 pt-6">
          <p class="text-slate-500 text-xs font-bold uppercase tracking-widest text-center mb-4">Or load saved fridge</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (profile of store.savedProfiles(); track profile.id) {
              <button (click)="store.loadProfile(profile)" class="flex flex-col text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all group">
                <div class="flex justify-between items-start mb-1">
                   <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">{{ profile.slotId }}</div>
                   <span class="material-icons-round text-emerald-500/50 group-hover:text-emerald-400 text-lg">arrow_forward</span>
                </div>
                <span class="text-white font-bold text-sm truncate w-full">{{ profile.name }}</span>
                <span class="text-[10px] text-slate-400">{{ profile.createdAt | date:'shortDate' }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow-y: auto; }
    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    
    .animate-scan { animation: scan 3s linear infinite; }
    @keyframes scan { 
      0%, 100% { top: 0%; opacity: 0; } 
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; } 
    }
  `]
})
export class CameraComponent {
  @ViewChild('videoRef') videoElement!: ElementRef<HTMLVideoElement>;
  
  private geminiService = inject(GeminiService);
  store = inject(StoreService);
  
  isStreamActive = signal(false);
  stream: MediaStream | null = null;

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isStreamActive.set(true);
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Could not access camera. Please try uploading a file.");
    }
  }

  async captureImage() {
    if (!this.videoElement.nativeElement) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.nativeElement.videoWidth;
    canvas.height = this.videoElement.nativeElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(this.videoElement.nativeElement, 0, 0);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    this.stopCamera();
    this.processImage(base64);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isStreamActive.set(false);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  async processImage(base64: string) {
    this.store.setLoading(true);
    try {
      const result = await this.geminiService.analyzeFridge(base64, this.store.dietaryFilter());
      this.store.setAnalysisResult(result);
      
      // Fallback: If AI detected ingredients but failed to generate recipes (common with empty or complex prompts),
      // we force a regeneration.
      if (result.detectedIngredients && result.detectedIngredients.length > 0 && result.recipes && result.recipes.length === 0) {
        console.warn('Analysis returned ingredients but no recipes. Triggering fallback generation...');
        await this.store.regenerateRecipes(result.detectedIngredients, this.store.dietaryFilter());
      }
      
      this.store.setView('dashboard');
    } catch (e) {
      console.error(e);
      this.store.setError("Failed to analyze image. Please try again.");
    } finally {
      this.store.setLoading(false);
    }
  }
}