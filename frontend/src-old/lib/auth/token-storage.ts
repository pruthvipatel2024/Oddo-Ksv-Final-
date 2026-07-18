/**
 * Safe client tokens interface wrapper.
 * Synchronizes with cookies to support Next.js Edge Middleware authentication checks.
 */
import { storageService } from '@/src/services/storage/storage.service';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return storageService.getItem(ACCESS_TOKEN_KEY, 'local');
  },

  setAccessToken: (token: string): void => {
    storageService.setItem(ACCESS_TOKEN_KEY, token, 'local');
    if (typeof document !== 'undefined') {
      // 1 hour expiration for cookie
      document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
    }
  },

  removeAccessToken: (): void => {
    storageService.removeItem(ACCESS_TOKEN_KEY, 'local');
    if (typeof document !== 'undefined') {
      document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
    }
  },

  getRefreshToken: (): string | null => {
    return storageService.getItem(REFRESH_TOKEN_KEY, 'local');
  },

  setRefreshToken: (token: string): void => {
    storageService.setItem(REFRESH_TOKEN_KEY, token, 'local');
  },

  removeRefreshToken: (): void => {
    storageService.removeItem(REFRESH_TOKEN_KEY, 'local');
  },

  clearTokens: (): void => {
    storageService.removeItem(ACCESS_TOKEN_KEY, 'local');
    storageService.removeItem(REFRESH_TOKEN_KEY, 'local');
    if (typeof document !== 'undefined') {
      document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
    }
  }
};
