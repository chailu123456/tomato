// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { resolve } from "path";
const pathResolve = (pathStr) => resolve(__dirname, pathStr);

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "src/styles/index.less";`
      }
    }
  },
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: pathResolve("./src")
      },
      {
        find: "~@",
        replacement: pathResolve("./src")
      },
      {
        find: "components",
        replacement: pathResolve("./src/components")
      },
      {
        find: "api",
        replacement: pathResolve("./src/api")
      },
      {
        find: /^~/,
        replacement: ""
      }
    ]
  },
  build: {},
  server: {
    // 代理
    proxy: {
      "/api": {
        target: "http://10.1.1.248:8124",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      },
      "/data-api": {
        target: "http://10.1.1.248:7077",
        changeOrigin: true
      },
      "/upload": {
        target: "http://10.1.1.248:12010",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, "")
      }
    },
    port: 8080,
    host: "0.0.0.0"
  }
});
