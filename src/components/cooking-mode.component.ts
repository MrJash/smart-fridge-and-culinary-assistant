import { Component, inject, computed, signal, ViewChild, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(text: string): SafeHtml {
    if (!text) return '';
    let html = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/^[•\-]\s/gm, '• ');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-cooking-mode',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <div class="h-full flex flex-col bg-slate-950 animate-fade-in relative">
      <!-- Header -->
      <div class="p-4 pt-6 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-20 shrink-0">
        <button (click)="store.setView('dashboard')" class="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition">
          <span class="material-icons-round">arrow_back</span>
        </button>
        <div class="flex-1 overflow-hidden">
           <h2 class="text-lg md:text-xl font-bold truncate text-white">{{ recipe()?.title }}</h2>
           <p class="text-xs text-emerald-400 font-medium uppercase tracking-wider">Cooking Mode</p>
        </div>
        <button (click)="toggleReadAloud()" [class.text-emerald-400]="isSpeaking" [class.bg-emerald-500_!important]="isSpeaking" [class.text-slate-950_!important]="isSpeaking" class="p-3 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 transition shadow-lg">
          <span class="material-icons-round">{{ isSpeaking ? 'volume_up' : 'volume_off' }}</span>
        </button>
      </div>

      <!-- Scrollable Steps -->
      <div class="flex-1 overflow-y-auto px-4 py-8 md:px-8 space-y-4 max-w-4xl mx-auto w-full pb-32 custom-scroll">
        @if (recipe()) {
          @for (step of recipe()?.steps; track $index) {
            <!-- Expandable Step Card -->
            <div class="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden transition-all duration-300" 
                 [class.border-emerald-500_!important]="expandedStepIndex === $index"
                 [class.bg-slate-800_!important]="expandedStepIndex === $index">
                 
               <div class="flex gap-4 p-4 md:p-6 cursor-pointer hover:bg-slate-800/80 transition-colors" (click)="toggleStepDetail($index)">
                <!-- Step Number -->
                <div class="flex-shrink-0 flex flex-col items-center">
                   <div class="w-10 h-10 rounded-full border-2 text-emerald-400 font-mono font-bold flex items-center justify-center text-lg shadow-lg transition-all z-10 tabular-nums"
                        [class.bg-emerald-600]="expandedStepIndex === $index"
                        [class.text-white]="expandedStepIndex === $index"
                        [class.border-emerald-500]="expandedStepIndex === $index"
                        [class.bg-slate-800]="expandedStepIndex !== $index"
                        [class.border-slate-700]="expandedStepIndex !== $index">
                    {{ $index + 1 }}
                   </div>
                </div>

                <!-- Step Content -->
                <div class="flex-1 pt-1">
                  <p class="text-lg font-normal leading-relaxed font-sans transition-colors" 
                     [class.text-white]="expandedStepIndex === $index"
                     [class.text-slate-300]="expandedStepIndex !== $index">
                    {{ step.instruction }}
                  </p>
                </div>
                
                <!-- Toggle Icon -->
                <div class="flex items-start pt-2 text-slate-500">
                  <span class="material-icons-round transition-transform duration-300" 
                        [class.rotate-180]="expandedStepIndex === $index">
                    expand_more
                  </span>
                </div>
              </div>

              <!-- Expanded Details Panel -->
              <div class="overflow-hidden transition-all duration-300 ease-in-out" 
                   [style.max-height]="expandedStepIndex === $index ? '500px' : '0px'"
                   [style.opacity]="expandedStepIndex === $index ? '1' : '0'">
                <div class="px-6 pb-6 pl-[4.5rem] pt-2">
                   <p class="text-slate-400 text-base leading-relaxed">
                     {{ step.detailedDescription }}
                   </p>
                   
                   <div class="mt-5 flex justify-end">
                      <button (click)="speakStep(step.instruction + '. ' + step.detailedDescription); $event.stopPropagation()" class="text-xs flex items-center gap-1.5 text-slate-500 hover:text-emerald-400 transition uppercase font-bold tracking-wider px-3 py-1.5 rounded-full hover:bg-emerald-500/10">
                        <span class="material-icons-round text-sm">volume_up</span> Read
                      </button>
                   </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
      
      <!-- AI Chef Floating Button -->
      <button (click)="toggleChat()" class="absolute bottom-24 right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-emerald-400/50">
        <span class="material-icons-round text-3xl">assistant</span>
      </button>

      <!-- Chat Overlay -->
      <div *ngIf="showChat" class="absolute inset-x-0 bottom-0 top-1/4 md:top-auto md:left-auto md:right-6 md:w-[420px] md:h-[500px] md:bottom-24 md:rounded-2xl z-50 bg-slate-900/98 backdrop-blur-xl border-t md:border border-slate-700/80 shadow-2xl shadow-black/40 flex flex-col animate-slide-up overflow-hidden">
        <!-- Chat Header -->
        <div class="p-4 bg-gradient-to-r from-emerald-600/20 to-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span class="material-icons-round text-emerald-400 text-xl">restaurant</span>
            </div>
            <div>
              <span class="font-bold text-white block">Chef Assistant</span>
              <span class="text-xs text-emerald-400/80">Ask anything about this recipe</span>
            </div>
          </div>
          <button (click)="toggleChat()" class="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition">
            <span class="material-icons-round">close</span>
          </button>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll flex flex-col" #chatContainer>
          @if (chatMessages().length === 0) {
            <div class="text-center text-slate-500 mt-12 px-4">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span class="material-icons-round text-emerald-500/50 text-3xl">chat</span>
              </div>
              <p class="text-sm font-medium">Ask me anything about this recipe!</p>
              <p class="mt-2 text-xs text-slate-600">"What side dish goes with this?"</p>
              <p class="text-xs text-slate-600">"Can I substitute the butter?"</p>
            </div>
          }
          @for (msg of chatMessages(); track $index) {
            @if (msg.sender === 'user') {
              <div class="self-end max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-emerald-600 text-white">
                {{ msg.text }}
              </div>
            } @else {
              <div class="self-start max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed bg-slate-800 text-slate-200" [innerHTML]="msg.text | markdown"></div>
            }
          }
          @if (isChatLoading) {
            <div class="self-start bg-slate-800 rounded-2xl px-4 py-2 flex gap-1">
              <div class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
              <div class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
              <div class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="p-4 bg-slate-800/30 border-t border-slate-700/50">
           <div class="flex gap-2 items-center">
             <input [(ngModel)]="userMessage" (keydown.enter)="sendMessage()" type="text" placeholder="Ask about ingredients, techniques, substitutions..." class="flex-1 bg-slate-950/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             <button (click)="sendMessage()" [disabled]="!userMessage.trim() || isChatLoading" class="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
               <span class="material-icons-round text-xl">send</span>
             </button>
           </div>
        </div>
      </div>

      <!-- Finish Button Overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-6 flex justify-center pb-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-30">
         <button (click)="store.setView('dashboard')" class="pointer-events-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-1">
           I'm Done!
         </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow: hidden; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  `]
})
export class CookingModeComponent {
  store = inject(StoreService);
  geminiService = inject(GeminiService);
  
  recipe = this.store.selectedRecipe;
  isSpeaking = false;
  synth = window.speechSynthesis;
  utterance: SpeechSynthesisUtterance | null = null;
  
  expandedStepIndex: number | null = null;
  
  // Chat State
  showChat = false;
  userMessage = '';
  chatMessages = signal<ChatMessage[]>([]);
  isChatLoading = false;
  
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  toggleStepDetail(index: number) {
    if (this.expandedStepIndex === index) {
      this.expandedStepIndex = null;
    } else {
      this.expandedStepIndex = index;
    }
  }

  toggleReadAloud() {
    if (this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    } else {
      this.readAllSteps();
    }
  }

  readAllSteps() {
    const steps = this.recipe()?.steps || [];
    const text = steps.map(s => s.instruction).join('. Next step. ');
    this.speak(text);
  }

  speakStep(text: string) {
    this.synth.cancel();
    this.speak(text);
  }

  private speak(text: string) {
    if (!text) return;
    this.isSpeaking = true;
    this.utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
    if (preferredVoice) this.utterance.voice = preferredVoice;
    this.utterance.rate = 0.9;
    
    this.utterance.onend = () => {
      this.isSpeaking = false;
    };
    this.synth.speak(this.utterance);
  }

  // Chat Methods
  toggleChat() {
    this.showChat = !this.showChat;
    if (this.showChat) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  async sendMessage() {
    if (!this.userMessage.trim() || this.isChatLoading) return;

    const userText = this.userMessage;
    this.chatMessages.update(msgs => [...msgs, { sender: 'user', text: userText }]);
    this.userMessage = '';
    this.isChatLoading = true;
    this.scrollToBottom();

    try {
      const response = await this.geminiService.askChef(this.recipe(), userText);
      this.chatMessages.update(msgs => [...msgs, { sender: 'ai', text: response }]);
    } catch (e) {
      this.chatMessages.update(msgs => [...msgs, { sender: 'ai', text: "Sorry, I couldn't reach the chef right now." }]);
    } finally {
      this.isChatLoading = false;
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 50);
    }
  }

  ngOnDestroy() {
    this.synth.cancel();
  }
}