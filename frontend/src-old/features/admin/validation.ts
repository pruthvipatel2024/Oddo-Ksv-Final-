export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email format (e.g. name@domain.com)';
  }
  return null;
};

export const validateVehicleReg = (reg: string): string | null => {
  if (!reg || reg.trim() === '') {
    return 'Registration number is required';
  }
  // Standard format: e.g. GJ01AB1234 (2 letters, 2 digits, 1-2 letters, 4 digits)
  // Let's normalize it to uppercase and strip whitespace for validation
  const normalized = reg.trim().replace(/[-\s]/g, '').toUpperCase();
  const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
  if (!regRegex.test(normalized)) {
    return 'Invalid format. Must match standard format (e.g., GJ01AB1234)';
  }
  return null;
};

export const validateRequired = (val: string, fieldName: string): string | null => {
  if (!val || val.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validatePositiveNumber = (val: number | string, fieldName: string): string | null => {
  const num = Number(val);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num <= 0) {
    return `${fieldName} must be greater than zero`;
  }
  return null;
};

export const validatePositiveInteger = (val: number | string, fieldName: string): string | null => {
  const num = Number(val);
  if (isNaN(num) || !Number.isInteger(num)) {
    return `${fieldName} must be a whole number`;
  }
  if (num <= 0) {
    return `${fieldName} must be greater than zero`;
  }
  return null;
};
