import bjorkPost from './bjork-post.json';
import ladyGagaTheFame from './lady-gaga-the-fame.json';
import glassAnimalsHowToBeAMHumanBeing from './glass-animals-how-to-be.json';

type Song = {
  title: string;
  duration: string;
};

type Album = {
  id: string;
  artist: string;
  title: string;
  cover: string;
  songs: Song[];
};

const albums: Album[] = [
  bjorkPost,
  ladyGagaTheFame,
  glassAnimalsHowToBeAMHumanBeing,
];

const artificialWait = (ms = 1500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getAll(): Promise<Album[]> {
  await artificialWait();
  return albums;
}

export async function getById(id: string): Promise<Album | undefined> {
  await artificialWait();
  return albums.find((album) => album.id === id);
}
