import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: true,
  server: {
    preset: "vercel",
    compatibilityDate: "2026-02-27",
  },
});
