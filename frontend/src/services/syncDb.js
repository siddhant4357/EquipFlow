import { openDB } from 'idb';

const DB_NAME = 'assetcheetah';
const DB_VERSION = 1;

const getDB = () =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for assets (pulled from server)
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'assetId' });
      }
      // Store for pending events (not yet synced)
      if (!db.objectStoreNames.contains('pendingEvents')) {
        db.createObjectStore('pendingEvents', { keyPath: 'localId', autoIncrement: true });
      }
    },
  });

// ─── Assets (Local Cache) ─────────────────────────────────────────────────────
export const saveAssets = async (assets) => {
  const db = await getDB();
  const tx = db.transaction('assets', 'readwrite');
  await Promise.all([...assets.map((a) => tx.store.put(a)), tx.done]);
};

export const getAllAssets = async () => {
  const db = await getDB();
  return db.getAll('assets');
};

export const findAssetById = async (assetId) => {
  const db = await getDB();
  return db.get('assets', assetId);
};

// ─── Pending Events (Offline Queue) ──────────────────────────────────────────
export const queueEvent = async (event) => {
  const db = await getDB();
  return db.add('pendingEvents', { ...event, clientTimestamp: new Date().toISOString() });
};

export const getPendingEvents = async () => {
  const db = await getDB();
  return db.getAll('pendingEvents');
};

export const clearPendingEvents = async () => {
  const db = await getDB();
  return db.clear('pendingEvents');
};

export const removePendingEvent = async (localId) => {
  const db = await getDB();
  return db.delete('pendingEvents', localId);
};

export const getPendingCount = async () => {
  const db = await getDB();
  return db.count('pendingEvents');
};
