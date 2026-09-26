import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        principal: resolve(import.meta.dirname, "index.html"),
        cursos: resolve(import.meta.dirname, "cursos.html"),
      },
    },
  },
});
