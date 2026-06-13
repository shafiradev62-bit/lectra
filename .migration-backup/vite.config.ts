import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // force Nitro on — preset auto-detected via NITRO_PRESET env (Vercel sets this)
  nitro: true,
});
