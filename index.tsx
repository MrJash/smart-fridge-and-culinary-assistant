import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';

// Inject API key into window from Vite build-time constant
if (typeof window !== 'undefined' && typeof __VITE_GEMINI_API_KEY__ !== 'undefined') {
  (window as any).VITE_GEMINI_API_KEY = __VITE_GEMINI_API_KEY__;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
}).catch((err) => console.error(err));
