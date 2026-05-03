/**
 * Global application state store using Zustand
 * 
 * Manages client-side UI state and user preferences with persistence.
 * This store is separate from server state (managed by React Query).
 * 
 * @module stores/appStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Application state interface
 * 
 * Includes UI state (sidebar, modals) and persisted user preferences
 */
interface AppState {
  // Theme and UI preferences
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal states
  dialogStates: Record<string, boolean>;
  setDialogState: (dialogId: string, open: boolean) => void;
  
  // User preferences (persisted)
  preferences: {
    defaultWardrobeView: 'grid' | 'list';
    autoSaveOutfits: boolean;
    showHelpTips: boolean;
  };
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  
  // Notification settings
  notifications: {
    showToasts: boolean;
    soundEnabled: boolean;
  };
  updateNotifications: (notifications: Partial<AppState['notifications']>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      dialogStates: {},
      setDialogState: (dialogId, open) => 
        set((state) => ({
          dialogStates: { ...state.dialogStates, [dialogId]: open }
        })),
      
      // Persisted Preferences
      preferences: {
        defaultWardrobeView: 'grid',
        autoSaveOutfits: true,
        showHelpTips: true,
      },
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        })),
      
      notifications: {
        showToasts: true,
        soundEnabled: false,
      },
      updateNotifications: (newNotifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...newNotifications }
        })),
    }),
    {
      name: 'wardrobe-app-store',
      partialize: (state) => ({
        preferences: state.preferences,
        notifications: state.notifications,
      }),
    }
  )
);