/**
 * Safe client tokens interface wrapper.
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
  },

  removeAccessToken: (): void => {
    storageService.removeItem(ACCESS_TOKEN_KEY, 'local');
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
  }
};
