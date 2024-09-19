import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'url';
import Path, { dirname } from 'path';
import { createElement } from 'react';
import { renderToReadableStream } from 'react-server-dom-webpack/server.browser';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

app.use('/build/*', serveStatic());

app.get('/', (c) =>
  c.html(`
    <html>
      <body>
        <div id="root"></div>
        <script type="module" src="/build/client.js"></script>
      </body>
    </html>
  `),
);

app.get('/rsc', async (c) => {
  const { App } = await import('../build/app.js');
  const stream = renderToReadableStream(createElement(App));
  return new Response(stream);
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

  await esbuild({
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    entryPoints: [resolveSrcPath('client.ts')],
    outdir: buildDir,
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
