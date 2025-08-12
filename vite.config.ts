import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// We can't use top-level await directly in defineConfig with TS without making it async,
// so we conditionally import plugins in setup.
export default defineConfig(async () => {
  const plugins = [react(), runtimeErrorOverlay()];

  // Temporarily disable cartographer plugin due to build issues
  // if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
  //   const cartographer = await import("@replit/vite-plugin-cartographer").then((m) =>
  //     m.cartographer()
  //   );
  //   plugins.push(cartographer);
  // }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      allowedHosts: [
        "lukamath.netlify.app",                  // Your main Netlify site
        "devserver-main--lukamath.netlify.app",  // Visual Editor preview domain
        "localhost",                             // Local dev
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
