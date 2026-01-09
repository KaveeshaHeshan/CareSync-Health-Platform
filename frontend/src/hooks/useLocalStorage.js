import { useState, useEffect } from 'react';

/**
 * Hook for persistent browser storage logic.
 *
 */
function useLocalStorage(key, initialValue) {
  // 1. Initialize state by checking localStorage first
  const [storedValue, setStoredValue] = useState(() => {
    // Check if window is defined for SSR compatibility
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Return parsed JSON or initialValue if null
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // 2. Wrap the setter function to persist to localStorage
  const setValue = (value) => {
    try {
      // Support functional updates like setState(prev => ...)
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Update React state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;