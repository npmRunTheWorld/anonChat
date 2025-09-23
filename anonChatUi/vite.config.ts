import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
  },
  server: {
    host: true, // allows 0.0.0.0
    port: 5173,
    strictPort: true, // optional, ensures the port doesn't auto-increment
    allowedHosts: ['.anonchat.obelion.net'], // allow your domain (subdomains supported with leading dot)
  },
});
