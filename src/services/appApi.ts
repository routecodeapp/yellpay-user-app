import { createApi } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';
import { axiosBaseQuery } from './axiosBaseQuery';

// YellPay backend base URL
export const API_BASE_URL = 'https://yellpay-backend.sukuuru.jp/api/v1';

// API Key for YellPay
export const YELLPAY_API_KEY = '$2y$06$HW4g1tsbUZEuutVVtp6yBeqYW0Syzgfc9DjKAYN16XbUP2gNgz.A2';

export const USER_AGENT = Platform.OS === 'ios' ? 'ios' : 'android';

// Registration request interface
export interface RegistrationRequest {
  name: string;
  furigana: string;
  phone_number: string;
  email: string;
  occupation: string;
  support_classification: string;
  device_type: 'android' | 'ios';
  device_id: string;
  postal_code: string;
  prefecture: string;
  city: string;
  street_number: string;
  building_name: string;
  referrer_code?: string;
}

// Registration response interfaces
export interface User {
  name: string;
  furigana: string;
  phoneNumber: string;
  email: string;
  occupation: string;
  supportClassification: string;
  address: string;
  phone_verified: string;
  registration_complete: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationResponse {
  status: 'success';
  message: string;
  data: {
    access_token: string;
    type: 'bearer';
    user: User;
  };
}

export interface RegistrationError {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Profile'],
  endpoints: builder => ({
    // Example secured endpoint
    getProfile: builder.query<{ id: string; name: string }, void>({
      query: () => ({ url: '/me', method: 'GET' }),
      providesTags: ['Profile'],
    }),

    // User registration endpoint
    registerUser: builder.mutation<RegistrationResponse, RegistrationRequest>({
      query: (body) => ({
        url: '/user/register',
        method: 'POST',
        data: body,
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
          'user-agent': USER_AGENT,
        },
      }),
    }),

    // Check phone number existence (step 1)
    checkPhoneNumber: builder.mutation<
      { status: 'success'; message: string; data: unknown[] },
      { phone_number: string }
    >({
      query: (body) => ({
        url: '/user/check-phone-number',
        method: 'POST',
        data: body,
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
        },
      }),
    }),

    // Phone register (requires Bearer + x-yellpay-key)
    phoneRegister: builder.mutation<
      { status: 'success'; message: string; data: User },
      { phone_number: string }
    >({
      query: (body) => ({
        url: '/user/phone-register',
        method: 'POST',
        data: body,
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
        },
      }),
    }),

    // Request OTP
    requestOtp: builder.mutation<
      { status: 'success' | 'error'; message: string; data?: { type: string; token: string } },
      { phone_number: string }
    >({
      query: (body) => ({
        url: '/user/otp/request',
        method: 'POST',
        data: body,
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
          'user-agent': USER_AGENT,
        },
      }),
    }),

    // Verify OTP
    verifyOtp: builder.mutation<
      RegistrationResponse,
      { otp: string; token: string }
    >({
      query: ({ otp, token }) => ({
        url: '/user/otp/verify',
        method: 'POST',
        data: { otp },
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
          'authorization': `Bearer ${token}`,
          'user-agent': USER_AGENT,
        },
      }),
    }),
  }),
});

export const { useGetProfileQuery, useRegisterUserMutation, useCheckPhoneNumberMutation, usePhoneRegisterMutation, useRequestOtpMutation, useVerifyOtpMutation } = appApi;
