// Plugins
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false, // Отключение минификации
    rollupOptions: {
      output: {
        // Отключение оптимизации роллапа
        manualChunks: undefined,
        treeshake: false,
      },
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 8080,
    onAfterSetupMiddleware(devServer) {
      devServer.app.post("*", (req, res) => {
        res.redirect(req.originalUrl);
      });
    },
    static: {
      directory: "./dist",
    },
  },
});
