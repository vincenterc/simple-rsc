import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'url';
import Path, { basename, relative } from 'path';
import { createElement } from 'react';
import { renderToReadableStream } from 'react-server-dom-webpack/server.browser';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile, writeFile } from 'fs/promises';
import { parse } from 'es-module-lexer';

const app = new Hono();
const clientComponentMap = {};

app.use('/build/*', serveStatic());

app.get('/', (c) =>
  c.html(`
    <html>
      <head>
        <title>React Server Components</title>
        <script src="https://cdn.tailwindcss.com"></script>
      <head>
      <body>
        <div id="root"></div>
        <script type="module" src="/build/client.js"></script>
      </body>
    </html>
  `),
);

app.get('/rsc', async (c) => {
  const { App } = await import('../build/app.js');
  const stream = renderToReadableStream(createElement(App), clientComponentMap);
  return new Response(stream);
});

async function build() {
  const clientEntryPoints = new Set<string>();

  await esbuild({
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    entryPoints: [resolveAppPath('app.tsx')],
    outdir: buildDir,
    packages: 'external',
    plugins: [
      {
        name: 'resolve-client-imports',
        setup(build) {
          // Intercept component imports to find client entry point
          build.onResolve(
            { filter: reactComponentTsExtensionRegex },
            async ({ path }) => {
              const absolutePath = resolveAppPath(path);
              const contents = await readFile(absolutePath, 'utf-8');
              if (contents.startsWith("'use client'")) {
                clientEntryPoints.add(absolutePath);
                return {
                  external: true,
                  path: `./${basename(path.replace(reactComponentTsExtensionRegex, '.js'))}`,
                };
              }
            },
          );
        },
      },
    ],
  });

  const { outputFiles } = await esbuild({
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    entryPoints: [resolveAppPath('client.ts'), ...clientEntryPoints],
    entryNames: '[name]',
    outdir: buildDir,
    splitting: true,
    write: false,
  });

  outputFiles.forEach(async (file) => {
    const [, exports] = parse(file.text);
    let newContents = file.text;

    for (const exp of exports) {
      const key = file.path + '$' + exp.n;

      clientComponentMap[key] = {
        id: `/build/${relative(buildDir, file.path)}`,
        name: exp.n,
        chunks: [],
        async: true,
      };

      newContents += `
${exp.ln}.$$typeof = Symbol.for('react.client.reference');
${exp.ln}.$$id = ${JSON.stringify(key)};
`;
    }

    await writeFile(file.path, newContents);
  });
}

serve(app, async (info) => {
  await build();
  console.log(`http://localhost:${info.port}`);
});

const appDir = fileURLToPath(new URL('./app', import.meta.url));
const buildDir = Path.join(appDir, '../../build');

function resolveAppPath(path = '') {
  if (Path.isAbsolute(path)) {
    return path;
  } else if (path.startsWith('./src/app')) {
    return Path.join(appDir, '../..', path);
  }
  return Path.join(appDir, path);
}

const reactComponentTsExtensionRegex = /\.tsx$/;
