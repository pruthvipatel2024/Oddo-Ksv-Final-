/**
 * Global logging helper.
 * Filters log levels depending on build target (e.g. suppresses debug/info logs in production).
 */
import { env } from '@/src/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const shouldLog = (level: LogLevel): boolean => {
  if (env.IS_PRODUCTION) {
    return level === 'warn' || level === 'error';
  }
  return true; // log everything in development/testing
};

export const logger = {
  debug: (message: string, ...optionalParams: any[]) => {
    if (shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...optionalParams);
    }
  },
  info: (message: string, ...optionalParams: any[]) => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  },
  warn: (message: string, ...optionalParams: any[]) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  },
  error: (message: string, ...optionalParams: any[]) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...optionalParams);
    }
  }
};
