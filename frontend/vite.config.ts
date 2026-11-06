import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // В режиме разработки запросы /api передаются на backend
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
