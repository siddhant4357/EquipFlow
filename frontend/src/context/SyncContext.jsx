import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/dataService';
import { saveAssets, getPendingEvents, getPendingCount, clearPendingEvents, queueEvent } from '../services/syncDb';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Track online/offline status
  useEffect(() => {
    const onOnline = () => { setIsOnline(true); autoSync(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    refreshPendingCount();
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const refreshPendingCount = async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  };

  // Pull all assets from server into IndexedDB
  const pullAssets = useCallback(async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      const result = await syncService.pullAssets();
      await saveAssets(result.data);
      setLastSynced(new Date());
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Push queued events to server
  const pushEvents = useCallback(async () => {
    if (!isOnline) return { synced: 0 };
    const events = await getPendingEvents();
    if (events.length === 0) return { synced: 0 };
    setIsSyncing(true);
    try {
      const result = await syncService.pushEvents(events);
      if (result.success) {
        await clearPendingEvents();
        await refreshPendingCount();
        setLastSynced(new Date());
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Queue an event for later sync (or sync now if online)
  const addEvent = useCallback(async (event) => {
    await queueEvent(event);
    await refreshPendingCount();
    if (isOnline) await pushEvents();
  }, [isOnline, pushEvents]);

  const autoSync = async () => {
    await pushEvents();
    await pullAssets();
  };

  const fetchPendingEvents = async () => {
    return await getPendingEvents();
  };

  const removeEvent = async (localId) => {
    const { removePendingEvent } = await import('../services/syncDb');
    await removePendingEvent(localId);
    await refreshPendingCount();
  };

  return (
    <SyncContext.Provider value={{ isOnline, pendingCount, isSyncing, lastSynced, pullAssets, pushEvents, addEvent, fetchPendingEvents, removeEvent }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
};
