/**
 * Generic storage utility wrapping LocalStorage and SessionStorage.
 * Handles server-side rendering boundaries gracefully.
 */

export const storageService = {
  getItem: (key: string, type: 'local' | 'session' = 'local'): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      return storage.getItem(key);
    } catch (e) {
      console.error(`Error reading key "${key}" from ${type}Storage`, e);
      return null;
    }
  },

  setItem: (key: string, value: string, type: 'local' | 'session' = 'local'): void => {
    if (typeof window === 'undefined') return;
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      storage.setItem(key, value);
    } catch (e) {
      console.error(`Error writing key "${key}" to ${type}Storage`, e);
    }
  },

  removeItem: (key: string, type: 'local' | 'session' = 'local'): void => {
    if (typeof window === 'undefined') return;
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      storage.removeItem(key);
    } catch (e) {
      console.error(`Error removing key "${key}" from ${type}Storage`, e);
    }
  },

  clear: (type: 'local' | 'session' = 'local'): void => {
    if (typeof window === 'undefined') return;
    try {
      const storage = type === 'local' ? localStorage : sessionStorage;
      storage.clear();
    } catch (e) {
      console.error(`Error clearing ${type}Storage`, e);
    }
  }
};
