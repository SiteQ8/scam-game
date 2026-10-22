import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { readFileSync } from 'node:fs';

const brand = JSON.parse(readFileSync(new URL('./brand.json', import.meta.url), 'utf8'));

// The shipped app never talks to the network: the policy below allows only files bundled with it.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function html(): Plugin {
  return {
    name: 'app-html',
    transformIndexHtml: {
      order: 'pre',
      handler(source, ctx) {
        let out = source.replace('%APP_TITLE%', brand.nameEn || 'Game');
        if (!ctx.server) out = out.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
        return out;
      },
    },
  };
}

export default defineConfig(({ mode }) => ({
  root: 'app',
  base: './',
  publicDir: 'public',
  plugins: [preact(), html()],
  define: { __BRAND__: JSON.stringify(brand), __APP_VERSION__: JSON.stringify(JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version) },
  build: {
    // A capture build exposes navigation for the screenshot tool and is never shipped.
    outDir: mode === 'capture' ? '../dist-capture' : '../dist',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { port: 5173, strictPort: true },
}));
