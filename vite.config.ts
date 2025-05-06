import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './', 
  plugins: [react(),
    VitePWA({
      injectRegister:"inline",
    // add this to cache all the imports
      workbox: {
      globPatterns: ["**/*"],
      maximumFileSizeToCacheInBytes: 3000000
    },
    // add this to cache all the
    // static assets in the public folder
    includeAssets: [
        "**/*",
    ],
      manifest: {
      "theme_color": "#234075",
      "background_color": "#234075",
      "display": "standalone",
      "id": "/offline",
      "scope": "/offline",
      "start_url": "/offline",
      "short_name": "Kiln offline",
      "description": "testing vite pwa",
      "name": "Form Application",
      "icons": [
          {
              "src": "/kiln-144.png",
              "sizes": "144x144",
              "type": "image/png",
          },     
          {
            "src": "/kiln-192.png",
            "sizes": "192x192",
            "type": "image/png",
          },  
          {
            "src": "/kiln-255.png",
            "sizes": "255x255",
            "type": "image/png",
          },  
          {
              "src": "/kiln.svg",
              "sizes": "400x400",
              "type": "image/svg",
              "purpose": "any"
          },          
      ],
        "file_handlers": [
            {
                "action": "/offline",
                "accept": {
                    "application/json": [
                        ".ffdry", ".json"
                    ]
                }
            }
        ]
  }},)
  ],
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  }
});