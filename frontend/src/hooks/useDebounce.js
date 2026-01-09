import { useState, useEffect } from 'react';

/**
 * Hook for search optimization for doctor lists.
 *
 */
function useDebounce(value, delay = 500) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 1. Set a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Cleanup: Cancel the timer if the value changes (typing continues) 
    // or if the component unmounts. This prevents the value from 
    // updating prematurely.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

export default useDebounce;