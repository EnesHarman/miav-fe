import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        bypass: function (req) {
          if (
            req.url?.startsWith('/auth/callback') &&
            req.url.includes('code=') &&
            !req.headers.accept?.includes('application/json')
          ) {
            // Rewrite the internal Vite request URL so it serves the React HTML app
            // instead of proxying the browser redirect to Tomcat
            req.url = '/index.html';
            return req.url;
          }
        }
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
