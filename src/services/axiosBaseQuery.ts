import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { RootState } from '../redux/store';

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  /** Optional: provide a different base URL for this specific request */
  baseUrlOverride?: string;
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

    const config: AxiosRequestConfig = {
      url: args.url,
      method: args.method ?? 'GET',
      baseURL: args.baseUrlOverride ?? baseUrl,
      data: args.data,
      params: args.params,
      headers: {
        'Content-Type': 'application/json',
        ...(args.headers ?? {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      signal,
    };

    // Debug logging
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      hasToken: !!token,
      headers: config.headers,
    });

    try {
      const result = await axios.request(config);
      return { data: result.data };
    } catch (rawError) {
      const err = rawError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
  };
