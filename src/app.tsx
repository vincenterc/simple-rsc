import { Suspense } from 'react';
import { getAll } from './data/data.ts';
import { Like } from './like.tsx';

export const App = () => (
  <>
    <h1 className="text-3xl mb-3">Spotifn’t</h1>
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
        <li key={a.id} className="flex gap-2 items-center mb-2">
          <img src={a.cover} alt={a.title} className="w-20 aspect-square" />
          <div>
            <h3 className="text-xl">{a.title}</h3>
            <p>{a.songs.length} songs</p>
            <Like />
          </div>
        </li>
      ))}
    </ul>
  );
}
