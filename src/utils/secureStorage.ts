// Secure storage utilities with basic encryption
const ENCRYPTION_KEY = 'contaflix_secure_key_v1';

// Simple XOR encryption for localStorage (better than plain text)
const encrypt = (text: string): string => {
  const key = ENCRYPTION_KEY;
  let encrypted = '';
  
  for (let i = 0; i < text.length; i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const textChar = text.charCodeAt(i);
    encrypted += String.fromCharCode(textChar ^ keyChar);
  }
  
  return btoa(encrypted); // Base64 encode the result
};

const decrypt = (encryptedText: string): string => {
  try {
    const encrypted = atob(encryptedText); // Base64 decode
    const key = ENCRYPTION_KEY;
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const encrypted = encrypt(value);
      localStorage.setItem(`sec_${key}`, encrypted);
    } catch (error) {
      console.error('Secure storage set failed:', error);
      // Fallback to regular storage in development
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(key, value);
      }
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(`sec_${key}`);
      if (!encrypted) {
        // Check for legacy unencrypted data
        const legacy = localStorage.getItem(key);
        if (legacy) {
          // Migrate to encrypted storage
          secureStorage.setItem(key, legacy);
          localStorage.removeItem(key);
          return legacy;
        }
        return null;
      }
      
      const decrypted = decrypt(encrypted);
      return decrypted || null;
    } catch (error) {
      console.error('Secure storage get failed:', error);
      // Try legacy storage as fallback
      return localStorage.getItem(key);
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(`sec_${key}`);
    localStorage.removeItem(key); // Also remove legacy
  },

  clear: (): void => {
    // Clear all secure storage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sec_') || key.startsWith('contaflix_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Specific functions for ContaFlix data
export const authStorage = {
  setClientId: (clientId: string) => secureStorage.setItem('contaflix_client_id', clientId),
  getClientId: () => secureStorage.getItem('contaflix_client_id'),
  
  setClientData: (data: object) => secureStorage.setItem('contaflix_client_data', JSON.stringify(data)),
  getClientData: () => {
    const data = secureStorage.getItem('contaflix_client_data');
    return data ? JSON.parse(data) : null;
  },
  
  setAccessToken: (token: string) => secureStorage.setItem('contaflix_access_token', token),
  getAccessToken: () => secureStorage.getItem('contaflix_access_token'),
  
  setBiometricId: (id: string) => secureStorage.setItem('contaflix_biometric_id', id),
  getBiometricId: () => secureStorage.getItem('contaflix_biometric_id'),
  
  clearAll: () => secureStorage.clear()
};