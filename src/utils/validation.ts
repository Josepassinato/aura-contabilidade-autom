import { log } from './logger';

/**
 * Type-safe validation utilities to prevent null/undefined errors
 */

// Type guards
export const isNullOrUndefined = <T>(value: T | null | undefined): value is null | undefined => {
  return value === null || value === undefined;
};

export const isNotNullOrUndefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isArray = <T>(value: any): value is T[] => {
  return Array.isArray(value);
};

export const isObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

// Safe accessors
export const safeGet = <T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined => {
  if (isNullOrUndefined(obj)) {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
};

export const safeGetNested = <T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined => {
  if (isNullOrUndefined(obj)) {
    return defaultValue;
  }

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (isNullOrUndefined(current) || !isObject(current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current ?? defaultValue;
};

// Safe array operations
export const safeMap = <T, R>(
  array: T[] | null | undefined,
  mapFn: (item: T, index: number) => R,
  componentName?: string
): R[] => {
  if (!isArray(array)) {
    log.warn('safeMap called with non-array value', array, componentName);
    return [];
  }

  try {
    return array.map(mapFn);
  } catch (error) {
    log.error('Error in safeMap operation', error, componentName);
    return [];
  }
};

export const safeFilter = <T>(
  array: T[] | null | undefined,
  filterFn: (item: T, index: number) => boolean,
  componentName?: string
): T[] => {
  if (!isArray(array)) {
    log.warn('safeFilter called with non-array value', array, componentName);
    return [];
  }

  try {
    return array.filter(filterFn);
  } catch (error) {
    log.error('Error in safeFilter operation', error, componentName);
    return [];
  }
};

export const safeFind = <T>(
  array: T[] | null | undefined,
  findFn: (item: T, index: number) => boolean,
  componentName?: string
): T | undefined => {
  if (!isArray(array)) {
    log.warn('safeFind called with non-array value', array, componentName);
    return undefined;
  }

  try {
    return array.find(findFn);
  } catch (error) {
    log.error('Error in safeFind operation', error, componentName);
    return undefined;
  }
};

// Safe async operations
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  defaultValue?: T,
  componentName?: string
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    log.error('Error in async operation', error, componentName);
    return defaultValue;
  }
};

// Safe JSON operations
export const safeJSONParse = <T>(
  jsonString: string | null | undefined,
  defaultValue?: T,
  componentName?: string
): T | undefined => {
  if (!isString(jsonString)) {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    log.error('Error parsing JSON', error, componentName);
    return defaultValue;
  }
};

export const safeJSONStringify = (
  value: any,
  defaultValue: string = '{}',
  componentName?: string
): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    log.error('Error stringifying JSON', error, componentName);
    return defaultValue;
  }
};

// Form validation helpers
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (isNullOrUndefined(value) || (isString(value) && value.trim() === '')) {
    return `${fieldName} é obrigatório`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!isString(email)) {
    return 'Email deve ser uma string válida';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email deve ter um formato válido';
  }
  return null;
};

export const validateLength = (
  value: string,
  min: number,
  max?: number,
  fieldName: string = 'Campo'
): string | null => {
  if (!isString(value)) {
    return `${fieldName} deve ser uma string válida`;
  }

  if (value.length < min) {
    return `${fieldName} deve ter pelo menos ${min} caracteres`;
  }

  if (max && value.length > max) {
    return `${fieldName} deve ter no máximo ${max} caracteres`;
  }

  return null;
};

// Component prop validation
export const ensureArray = <T>(value: T[] | null | undefined, componentName?: string): T[] => {
  if (!isArray(value)) {
    log.warn('Expected array but received:', value, componentName);
    return [];
  }
  return value;
};

export const ensureString = (value: string | null | undefined, defaultValue: string = '', componentName?: string): string => {
  if (!isString(value)) {
    log.warn('Expected string but received:', value, componentName);
    return defaultValue;
  }
  return value;
};

export const ensureNumber = (value: number | null | undefined, defaultValue: number = 0, componentName?: string): number => {
  if (!isNumber(value)) {
    log.warn('Expected number but received:', value, componentName);
    return defaultValue;
  }
  return value;
};