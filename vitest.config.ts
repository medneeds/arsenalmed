import { defineConfig } from "vitest/config";

// Testes de regras puras (sem a configuração da aplicação).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
