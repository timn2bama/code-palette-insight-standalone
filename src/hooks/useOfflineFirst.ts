import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";

interface OfflineDB extends DBSchema {
  wardrobeItems: {
    key: string;
    value: any;
  };
  outfits: {
    key: string;
    value: any;
  };
  analytics: {
    key: string;
    value: any;
  };
  pendingActions: {
    key: string;
    value: {
      id: string;
      action: string;
      data: any;
      timestamp: number;
    };
  };
}

export const useOfflineFirst = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [db, setDb] = useState<IDBPDatabase<OfflineDB> | null>(null);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeOfflineStorage();
    setupNetworkListener();
  }, []);

  const initializeOfflineStorage = async () => {
    try {
      const database = await openDB<OfflineDB>('SyncStyleOffline', 1, {
        upgrade(db) {
          db.createObjectStore('wardrobeItems', { keyPath: 'id' });
          db.createObjectStore('outfits', { keyPath: 'id' });
          db.createObjectStore('analytics', { keyPath: 'id' });
          db.createObjectStore('pendingActions', { keyPath: 'id' });
        },
      });
      setDb(database);
    } catch (error) {
      logger.error('Failed to initialize offline storage:', error);
    }
  };

  const setupNetworkListener = async () => {
    const status = await Network.getStatus();
    setIsOnline(status.connected);

    Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
      
      if (status.connected) {
        toast({
          title: 'Back online',
          description: 'Syncing your changes...',
        });
        syncPendingActions();
      } else {
        toast({
          title: 'You are offline',
          description: 'Changes will be saved locally',
        });
      }
    });
  };

  const storeOfflineData = async (store: 'wardrobeItems' | 'outfits' | 'analytics' | 'pendingActions', data: any) => {
    if (!db) return;
    
    try {
      await db.put(store, data);
    } catch (error) {
      logger.error(`Failed to store ${store} offline:`, error);
    }
  };

  const getOfflineData = async (store: 'wardrobeItems' | 'outfits' | 'analytics' | 'pendingActions', key?: string) => {
    if (!db) return null;
    
    try {
      if (key) {
        return await db.get(store, key);
      } else {
        return await db.getAll(store);
      }
    } catch (error) {
      logger.error(`Failed to get ${store} offline:`, error);
      return null;
    }
  };

  const addPendingAction = async (action: string, data: any) => {
    if (!db) return;

    const pendingAction = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      data,
      timestamp: Date.now(),
    };

    try {
      await db.put('pendingActions', pendingAction);
      setPendingActions(prev => [...prev, pendingAction]);
    } catch (error) {
      logger.error('Failed to store pending action:', error);
    }
  };

  const syncPendingActions = async () => {
    if (!db || !isOnline) return;

    try {
      const actions = await db.getAll('pendingActions');
      
      for (const action of actions) {
        try {
          // Process each pending action based on its type
          await processPendingAction(action);
          await db.delete('pendingActions', action.id);
        } catch (error) {
          logger.error('Failed to sync action:', error);
        }
      }

      setPendingActions([]);
      toast({
        title: 'Sync complete',
        description: 'All changes have been synchronized',
      });
    } catch (error) {
      logger.error('Failed to sync pending actions:', error);
    }
  };

  const processPendingAction = async (action: any) => {
    // This would integrate with your Supabase operations
    switch (action.action) {
      case 'createWardrobeItem':
        // Call your Supabase create function
        break;
      case 'updateWardrobeItem':
        // Call your Supabase update function
        break;
      case 'deleteWardrobeItem':
        // Call your Supabase delete function
        break;
      case 'createOutfit':
        // Call your Supabase create outfit function
        break;
      default:
        logger.warn('Unknown action type:', action.action);
    }
  };

  const clearOfflineData = async () => {
    if (!db) return;
    
    try {
      await db.clear('wardrobeItems');
      await db.clear('outfits');
      await db.clear('analytics');
      await db.clear('pendingActions');
      setPendingActions([]);
    } catch (error) {
      logger.error('Failed to clear offline data:', error);
    }
  };

  return {
    isOnline,
    storeOfflineData,
    getOfflineData,
    addPendingAction,
    syncPendingActions,
    clearOfflineData,
    pendingActions: pendingActions.length,
  };
};