/**
 * API-related headers and errors constants
 */
export const API_CONSTANTS = {
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    ACCEPT: 'application/json',
  },
  ERRORS: {
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'Session expired. Please log in again.',
  },
};
