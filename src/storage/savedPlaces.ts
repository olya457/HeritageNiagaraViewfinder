import AsyncStorage from '@react-native-async-storage/async-storage';

export type Coords = { lat: number; lng: number };
export type SavedPlace = {
  id: string;
  title: string;
  address: string;
  coords: Coords;
};

const KEY = 'saved_places_v1';

export async function getSavedPlaces(): Promise<SavedPlace[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as SavedPlace[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function setSavedPlaces(arr: SavedPlace[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(arr));
}

export async function isSaved(id: string) {
  const list = await getSavedPlaces();
  return list.some(p => p.id === id);
}

export async function savePlace(p: SavedPlace) {
  const list = await getSavedPlaces();
  if (list.some(x => x.id === p.id)) return; 
  list.push(p);
  await setSavedPlaces(list);
}

export async function removePlace(id: string) {
  const list = await getSavedPlaces();
  await setSavedPlaces(list.filter(p => p.id !== id));
}

export async function toggleSave(p: SavedPlace) {
  const saved = await isSaved(p.id);
  if (saved) {
    await removePlace(p.id);
    return false;
  } else {
    await savePlace(p);
    return true;
  }
}
