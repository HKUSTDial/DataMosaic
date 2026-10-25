import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  const ontology = process.env.ONTOLOGY_URL || env.ONTOLOGY_URL || 'http://127.0.0.1:8011';
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      proxy: { '/ontomosaic-text2sql/api/': ontology, '/ontology/api/': ontology },
    },
  };
});
