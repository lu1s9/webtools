// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://lu1s9.github.io",
  base: "/webtools",
  integrations: [react(), sentry(), sitemap()],

  vite: {
    plugins: [tailwindcss(), wasm(), topLevelAwait()],
    worker: {
      format: "es",
    },
    optimizeDeps: {
      exclude: [
        "@jsquash/png",
        "@jsquash/jpeg",
        "@jsquash/webp",
        "@jsquash/avif",
        "@jsquash/resize",
        "@ffmpeg/ffmpeg",
        "@ffmpeg/util",
      ],
    },
  },
});