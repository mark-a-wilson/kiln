import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
  },
  define: {
    'import.meta.env.VITE_COMM_API_SAVEDATA_ENDPOINT_URL': JSON.stringify(process.env.VITE_COMM_API_SAVEDATA_ENDPOINT_URL),
    'import.meta.env.VITE_COMM_API_GENERATE_ENDPOINT_URL': JSON.stringify(process.env.VITE_COMM_API_GENERATE_ENDPOINT_URL),
    'import.meta.env.VITE_COMM_API_EDIT_ENDPOINT_URL': JSON.stringify(process.env.VITE_COMM_API_EDIT_ENDPOINT_URL),
    'import.meta.env.VITE_COMM_API_SAVEDATA_ICM_ENDPOINT_URL': JSON.stringify(process.env.VITE_COMM_API_SAVEDATA_ICM_ENDPOINT_URL),
    'import.meta.env.VITE_COMM_API_LOADDATA_ICM_ENDPOINT_URL': JSON.stringify(process.env.VITE_COMM_API_LOADDATA_ICM_ENDPOINT_URL),
    'import.meta.env.VITE_COMM_API_UNLOCK_ICM_FORM_URL': JSON.stringify(process.env.VITE_COMM_API_UNLOCK_ICM_FORM_URL),
    'import.meta.env.VITE_TEMPLATE_REPO_URL': JSON.stringify(process.env.VITE_TEMPLATE_REPO_URL),
    'import.meta.env.VITE_KLAMM_URL': JSON.stringify(process.env.VITE_KLAMM_URL),
    'import.meta.env.VITE_SSO_REDIRECT_URL': JSON.stringify(process.env.VITE_SSO_REDIRECT_URL),
    'import.meta.env.VITE_SSO_AUTH_SERVER_URL': JSON.stringify(process.env.VITE_SSO_AUTH_SERVER_URL),
    'import.meta.env.VITE_SSO_REALM': JSON.stringify(process.env.VITE_SSO_REALM),
    'import.meta.env.VITE_SSO_CLIENT_ID': JSON.stringify(process.env.VITE_SSO_CLIENT_ID),
  },
});