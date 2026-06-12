import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const isDev = process.env.NODE_ENV !== "production";
const backendTarget = isDev ? "http://localhost:8000" : "http://3.111.60.193";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/media": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
