/**
 * Decodes JWT session contents on frontend to verify validation and expirations.
 */

export interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  organizationId: string | null;
  exp: number;
  iat: number;
}

export const authSession = {
  decodeToken: (token: string): DecodedToken | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      // Decode base64 URL safe string
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (e) {
      console.error('Failed to parse and decode JWT token', e);
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    const decoded = authSession.decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
};
