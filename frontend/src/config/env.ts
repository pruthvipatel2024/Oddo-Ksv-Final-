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
  const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const rawWsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_sandbox_key';
  
  const mapTileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const nominatimUrl = process.env.NEXT_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org/search';
  const osrmUrl = process.env.NEXT_PUBLIC_OSRM_URL || 'https://router.project-osrm.org';

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

  return {
    API_BASE_URL: apiBaseUrl,
    WS_URL: wsUrl,
    RAZORPAY_KEY_ID: razorpayKeyId,
    MAP_TILE_URL: mapTileUrl,
    NOMINATIM_URL: nominatimUrl,
    OSRM_URL: osrmUrl,
    IS_PRODUCTION: nodeEnv === 'production',
    IS_DEVELOPMENT: nodeEnv === 'development',
    IS_TEST: nodeEnv === 'test',
  };
};

export const env = validateEnv();
