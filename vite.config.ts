import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
