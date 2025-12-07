import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // JSON.stringify(env.API_KEY) returns undefined if the key is missing.
      // We must provide a fallback string ("") to ensure `process.env.API_KEY` is replaced 
      // with a string in the browser code, preventing "ReferenceError: process is not defined".
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    }
  };
});