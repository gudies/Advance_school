export const getFirebaseUrl = (): string | undefined => {
  const url = import.meta.env.VITE_FIREBASE_DB_URL;
  if (!url) return undefined;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const isFirebaseConfigured = (): boolean => {
  return !!getFirebaseUrl();
};

export const getFirebaseUrlForNode = (key: string): string | undefined => {
  const baseUrl = getFirebaseUrl();
  if (!baseUrl) return undefined;
  const namespace = import.meta.env.VITE_FIREBASE_NAMESPACE || '';
  const prefix = namespace ? `${namespace}/` : '';
  return `${baseUrl}/${prefix}${key}.json`;
};

export async function pushToFirebase(key: string, data: unknown): Promise<void> {
  const url = getFirebaseUrlForNode(key);
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Firebase Sync failed for key [${key}]:`, error);
  }
}

export async function pullFromFirebase(key: string): Promise<unknown> {
  const url = getFirebaseUrlForNode(key);
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Firebase Pull failed for key [${key}]:`, error);
    return null;
  }
}

/**
 * Downloads all known collections from Firebase and hydrates localStorage.
 * If Firebase has no data for a collection, pushes the local seed data up.
 */
export async function pullAndHydrateAll(keys: string[]): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const promises = keys.map(async (key) => {
    const data = await pullFromFirebase(key);
    if (data !== null) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      // Sync local seed data up to Firebase if Firebase is empty for this node
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await pushToFirebase(key, parsed);
          } else if (parsed && typeof parsed === 'object') {
            await pushToFirebase(key, parsed);
          }
        } catch (error) {
          console.error(`Failed to push local seed data for key [${key}] to Firebase:`, error);
        }
      }
    }
  });

  await Promise.all(promises);
}
