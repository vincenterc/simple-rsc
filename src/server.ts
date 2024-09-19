import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'url';
import Path, { dirname } from 'path';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';

const app = new Hono();

app.get('/', async (c) => {
  const { App } = await import('../build/app.js');
  const html = renderToString(createElement(App));
  return c.html(html);
});

async function build() {
  await esbuild({
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    entryPoints: [resolveSrcPath('app.tsx')],
    outdir: buildDir,
    packages: 'external',
  });
}

serve(app, async (info) => {
  await build();
  console.log(`http://localhost:${info.port}`);
});

const srcDir = fileURLToPath(dirname(import.meta.url));
const buildDir = Path.join(srcDir, '../build');

function resolveSrcPath(path = '') {
  return Path.join(srcDir, path);
}
