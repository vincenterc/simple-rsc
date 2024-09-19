import { createRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

// HACK: map webpack resolution to native ESM
// @ts-expect-error '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
window.__webpack_require__ = (id) => {
  return import(id);
};

const root = createRoot(document.getElementById('root'));

createFromFetch(fetch('/rsc')).then((comp) => root.render(comp));
