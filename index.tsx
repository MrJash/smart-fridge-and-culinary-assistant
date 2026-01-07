import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './src/app.component';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (typeof window !== 'undefined' && geminiApiKey) {
  (window as any).VITE_GEMINI_API_KEY = geminiApiKey;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
}).catch((err) => console.error(err));
