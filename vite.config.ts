import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.DEV': command === 'serve',
      'import.meta.env.PROD': command === 'build'
    }
  };
});
