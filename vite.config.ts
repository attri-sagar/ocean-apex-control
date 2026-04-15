import "dotenv/config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { aiTasksApiPlugin } from "./vite-plugin-ai-tasks.ts";
import { rssApiPlugin } from "./vite-plugin-rss.ts";
import { agentsApiPlugin } from "./vite-plugin-agents.ts";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), aiTasksApiPlugin(), rssApiPlugin(), agentsApiPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
