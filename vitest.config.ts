import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes de regras puras (sem a configuração da aplicação).
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
