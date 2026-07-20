import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to the ASP.NET backend during development.
      "/api": {
        target: "http://localhost:5014",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
