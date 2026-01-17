import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    method = 'GET',
    body = null,
    headers = {},
    immediate = true, // Fetch immediately on mount
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (customUrl = null, customOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const finalUrl = customUrl || url;
      const finalMethod = customOptions.method || method;
      const finalBody = customOptions.body || body;
      const finalHeaders = { ...headers, ...customOptions.headers };

      const config = {
        method: finalMethod,
        url: finalUrl,
        headers: finalHeaders,
        ...(finalBody && { data: finalBody })
      };

      const response = await axiosInstance(config);
      
      setData(response.data);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    }
  }, [url, method, body, headers, onSuccess, onError]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, url, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    reset,
    fetchData
  };
};
