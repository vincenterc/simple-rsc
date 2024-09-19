import { Suspense } from 'react';
import { getAll } from './data/data.ts';

export const App = () => (
  <>
    <h1>Spotifn’t</h1>
    <Suspense fallback={<p>Getting albums...</p>}>
      {/* @ts-expect-error 'Promise<Element>' is not a valid JSX element type. */}
      <Albums />
    </Suspense>
  </>
);

async function Albums() {
  const data = await getAll();
  return (
    <ul>
      {data.map((a) => (
        <li key={a.id}>
          <img src={a.cover} alt={a.title} />
          <div>
            <h3>{a.title}</h3>
            <p>{a.songs.length} songs</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
