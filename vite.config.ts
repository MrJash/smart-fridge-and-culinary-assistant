import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
});
