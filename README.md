# WebTools

Browser-based developer tools that run entirely on your machine. No server, no uploads, no accounts — just drag, configure, and download.

## Why

As a web developer, I constantly receive assets from designers and other teams — images, audio files, fonts — that aren't optimized for the web. Converting a PNG to WebP, compressing a WAV to MP3, or resizing a batch of images shouldn't require installing desktop software, uploading files to sketchy online converters, or paying for a SaaS tool.

WebTools solves this by running everything **100% client-side** using WebAssembly. Your files never leave your browser.

## Tools

### Image Optimizer
Convert and compress images with granular control.

- **Input**: PNG, JPG, WebP, AVIF
- **Output**: PNG, JPG, WebP, AVIF
- **Controls**: Output format, quality (1-100), resize with aspect ratio lock
- **Features**: Live size estimation, batch processing, ZIP download

### Audio Optimizer
Convert and compress audio files with codec-level control.

- **Input**: WAV, MP3, FLAC, OGG, AAC, M4A, OPUS, WMA
- **Output**: MP3, OGG (Vorbis), AAC, OPUS
- **Controls**: Output format, bitrate (64-320 kbps), sample rate (22.05-48 kHz)
- **Features**: Live size estimation, audio preview, batch processing, ZIP download

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | [Astro](https://astro.build) | Multi-page architecture with zero JS by default. Each tool is an independent page — only the interactive parts (React islands) ship JavaScript to the client. |
| UI Islands | [React](https://react.dev) | Each tool needs complex client-side state (file lists, sliders, processing pipelines). React handles the interactive islands while Astro handles the static shell. |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS with no build config. The new v4 engine uses native CSS cascade layers and `@theme` for design tokens. |
| Components | [shadcn/ui](https://ui.shadcn.com) | Not a dependency — components are copied into the project and owned by us. Accessible, composable, and fully customizable. Uses Radix primitives under the hood. |
| Image processing | [jSquash](https://github.com/jamsinclair/jSquash) | WASM codecs extracted from Google's Squoosh project, rebuilt for the browser. Each codec (`@jsquash/png`, `@jsquash/webp`, `@jsquash/avif`, `@jsquash/jpeg`) is a separate package — only the ones you use get loaded. |
| Audio processing | [FFmpeg.wasm](https://github.com/nicasioca/nicasioca) | FFmpeg compiled to WebAssembly. Single-thread core loaded from CDN (~30 MB, cached after first use). No special headers required. |
| ZIP bundling | [JSZip](https://stuk.github.io/jszip/) | Client-side ZIP generation for batch downloads. |
| Deploy | [GitHub Pages](https://pages.github.com) | Static hosting with automatic deploys via GitHub Actions on every push to `main`. |

## Architecture decisions

- **Client-side only**: No backend, no database, no auth. Processing happens in the browser via WASM. This means zero hosting costs and complete privacy.
- **Astro islands**: Instead of shipping a full React SPA, only interactive components hydrate on the client. The layout, navigation, and static content are pure HTML with zero JavaScript.
- **Dynamic imports for codecs**: Image codecs are loaded on demand (`await import("@jsquash/webp")`). If you only convert to WebP, you never download the AVIF codec.
- **FFmpeg loaded from CDN**: The ~30 MB WASM binary loads on first use and gets cached by the browser. This keeps the initial page load fast.
- **Vite WASM config**: jSquash packages are excluded from Vite's dependency optimizer (`optimizeDeps.exclude`) and `vite-plugin-wasm` handles ESM WASM imports correctly.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
```

Static output goes to `dist/`.
