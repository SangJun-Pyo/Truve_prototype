import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        index:      resolve(__dirname, "index.html"),
        donation:   resolve(__dirname, "donation.html"),
        foundations:resolve(__dirname, "foundations.html"),
        governance: resolve(__dirname, "governance.html"),
        status:     resolve(__dirname, "status.html"),
        about:      resolve(__dirname, "about.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
