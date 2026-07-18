/**
 * Strict Environment Variable Validation Layer.
 * Ensures typed constants, formats checks (starts with protocol, no trailing slash),
 * and throws descriptive errors on initialization.
 */

// Helper to validate and clean a URL string
const parseAndValidateURL = (name: string, value: string | undefined, expectedProtocols: string[]): string => {
  if (!value) {
    throw new Error(`Environment Variable Validation Error: "${name}" is missing or empty.`);
  }

  const cleanedValue = value.trim();
  
  // Protocol prefix verification
  const hasValidProtocol = expectedProtocols.some((proto) => cleanedValue.startsWith(proto));
  if (!hasValidProtocol) {
    throw new Error(
      `Environment Variable Validation Error: "${name}" has invalid value "${cleanedValue}". Expected protocol prefix: ${expectedProtocols.join(' or ')}.`
    );
  }

  // Trailing slash verification (automatically remove to avoid endpoint format errors)
  if (cleanedValue.endsWith('/')) {
    return cleanedValue.slice(0, -1);
  }

  return cleanedValue;
};

// Validate variables and export typed configuration object
const validateEnv = () => {
  // Access variables statically so Next.js compiler can inline them for the browser build
  const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const rawWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  
  const nodeEnv = process.env.NODE_ENV || 'development';

  const apiBaseUrl = parseAndValidateURL(
    'NEXT_PUBLIC_API_BASE_URL',
    rawApiBaseUrl,
    ['http://', 'https://']
  );
  
  const wsUrl = parseAndValidateURL(
    'NEXT_PUBLIC_WS_URL',
    rawWsUrl,
    ['http://', 'https://', 'ws://', 'wss://']
  );

  if (!razorpayKeyId) {
    throw new Error('Environment Variable Validation Error: "NEXT_PUBLIC_RAZORPAY_KEY_ID" is missing.');
  }

  return {
    API_BASE_URL: apiBaseUrl,
    WS_URL: wsUrl,
    GOOGLE_MAPS_KEY: googleMapsKey,
    RAZORPAY_KEY_ID: razorpayKeyId,
    IS_PRODUCTION: nodeEnv === 'production',
    IS_DEVELOPMENT: nodeEnv === 'development',
    IS_TEST: nodeEnv === 'test',
  };
};

export const env = validateEnv();
