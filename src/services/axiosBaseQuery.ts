import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import type { RootState } from '../redux/store';

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  /** Optional: provide a different base URL for this specific request */
  baseUrlOverride?: string;
  /** Explicitly mark as FormData if detection fails */
  isFormData?: boolean;
};

export const axiosBaseQuery =
  ({
    baseUrl,
  }: {
    baseUrl: string;
  }): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    { status?: number; data?: unknown }
  > =>
  async (args, api) => {
    const { getState, signal } = api;
    const state = getState() as RootState;
    const token = state.registration.token; // from our registration slice

    // Check if data is FormData - React Native FormData detection
    // Use explicit flag first, then try detection
    const isFormData = 
      args.isFormData === true ||
      args.data instanceof FormData || 
      (args.data && typeof args.data === 'object' && args.data.constructor && args.data.constructor.name === 'FormData') ||
      (args.data && typeof args.data === 'object' && '_parts' in args.data);
    
    // Ensure method is explicitly set - don't default to GET for mutations
    const method = args.method || 'GET';
    
    const config: AxiosRequestConfig = {
      url: args.url,
      method: method,
      baseURL: args.baseUrlOverride ?? baseUrl,
      data: args.data,
      params: args.params,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(args.headers ?? {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      signal,
      // Ensure FormData is not transformed - React Native needs this
      transformRequest: isFormData ? [(data) => data] : undefined,
    };

    // Debug logging
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      argsMethod: args.method,
      hasToken: !!token,
      isFormData: isFormData,
      hasData: !!args.data,
      dataType: args.data ? typeof args.data : 'no data',
      headers: config.headers,
      ...(args.url === '/user/profile/update' && args.data && !isFormData ? {
        requestBody: JSON.stringify(args.data, null, 2)
      } : {}),
      ...(args.url?.startsWith('/user/') && args.method === 'POST' && args.data && !isFormData ? {
        requestBody: JSON.stringify(args.data, null, 2),
        fullUrl: `${config.baseURL}${config.url}`
      } : {}),
    });

    // For FormData in React Native, use fetch API instead of axios
    // Axios has known issues with FormData in React Native
    if (isFormData && Platform.OS !== 'web') {
      try {
        const fullUrl = `${config.baseURL}${config.url}`;
        
        // Prepare headers for fetch - remove Content-Type to let fetch set it with boundary
        const fetchHeaders: Record<string, string> = {};
        Object.keys(config.headers || {}).forEach((key) => {
          const value = (config.headers as any)[key];
          // Don't set Content-Type for FormData - fetch will set it automatically
          if (key.toLowerCase() !== 'content-type' && value !== undefined && value !== null) {
            fetchHeaders[key] = String(value);
          }
        });
        
        console.log('Using fetch API for FormData upload:', {
          url: fullUrl,
          method: config.method,
          headers: fetchHeaders,
          hasFormData: !!args.data,
        });
        
        const response = await fetch(fullUrl, {
          method: config.method as string,
          headers: fetchHeaders,
          body: args.data as FormData,
          signal: signal as AbortSignal,
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Fetch API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          });
          return {
            error: {
              status: response.status,
              data: responseData,
            },
          };
        }
        
        console.log('Fetch API Success:', responseData);
        return { data: responseData };
      } catch (fetchError: any) {
        console.error('Fetch API Error:', {
          url: `${config.baseURL}${config.url}`,
          message: fetchError.message,
          error: fetchError,
        });
        return {
          error: {
            status: undefined,
            data: fetchError.message || 'Network Error',
          },
        };
      }
    }

    try {
      const result = await axios.request(config);
      if (args.url === '/user/profile/update') {
        console.log('✅ Profile update API response:', JSON.stringify(result.data, null, 2));
      }
      if (args.url === '/user/profile' && args.method === 'GET') {
        console.log('📥 GET Profile API response:', JSON.stringify(result.data, null, 2));
      }
      return { data: result.data };
    } catch (rawError) {
      const err = rawError as AxiosError;
      console.error('API Error:', {
        url: `${config.baseURL}${config.url}`,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        code: err.code,
      });
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };
