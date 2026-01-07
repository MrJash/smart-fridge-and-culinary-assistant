import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      __VITE_GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY || '')
    }
  };
});
