/**
 * Utility to clean up all mock data from the system
 * This should be run once to transition from development/testing to production
 */

export const cleanupAllMockData = () => {
  try {
    // List of keys that were used for mock data
    const mockKeys = [
      'mock_session',
      'user_role',
      'test_mode',
      'demo_data',
      'mock_client_data',
      'mock_user_profile',
      'development_mode'
    ];

    // Remove all mock keys from localStorage
    mockKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Remove any keys that contain 'mock' or 'test'
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('mock') || 
          key.toLowerCase().includes('test') || 
          key.toLowerCase().includes('demo')) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage as well
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.toLowerCase().includes('mock') || 
            key.toLowerCase().includes('test') || 
            key.toLowerCase().includes('demo')) {
          sessionStorage.removeItem(key);
        }
      });
    }

    console.log('All mock data cleaned successfully');
    return true;
  } catch (error) {
    console.error('Error cleaning mock data:', error);
    return false;
  }
};

/**
 * Check if the system is in production mode (no mock data)
 */
export const isProductionMode = () => {
  const hasMockData = Object.keys(localStorage).some(key => 
    key.toLowerCase().includes('mock') || 
    key.toLowerCase().includes('test') || 
    key.toLowerCase().includes('demo')
  );
  
  return !hasMockData;
};

/**
 * Force production mode by cleaning all mock data and reloading
 */
export const enforceProductionMode = () => {
  cleanupAllMockData();
  window.location.reload();
};