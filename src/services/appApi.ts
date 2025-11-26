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
  device_type: 'android' | 'ios';
  device_id: string;
  postal_code: string;
  prefecture: string;
  city: string;
  street_number: string;
  building_name: string;
  referrer_code?: string;
}

// Address interface
export interface Address {
  postal_code: string;
  prefecture: string;
  city: string;
  street_number: string;
  building_name: string;
}

// Registration response interfaces
export interface User {
  id: string;
  avatar: string | null;
  name: string;
  furigana: string;
  phoneNumber: string;
  email: string;
  occupation: string;
  support_classification?: string | null;
  address: Address | string;
  phone_verified: string;
  is_active: number;
  registration_complete: string;
  card_registered: string;
  yellpay_sdk_id: string | null;
  disable_view_id: string;
  referrer_code?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  status: 'success' | 'error';
  message: string;
  data: User;
  meta: null;
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

    // Get user profile (requires Bearer token + x-yellpay-key)
    // Note: Bearer token is automatically added by axiosBaseQuery middleware
    getUserProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: '/user/profile',
        method: 'GET',
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
          'user-agent': USER_AGENT,
        },
      }),
      providesTags: ['Profile'],
    }),

    // Delete user account
    deleteUser: builder.mutation<
      { status: 'success' | 'error'; message: string; data: string },
      void
    >({
      query: () => ({
        url: '/user/delete-user',
        method: 'GET',
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
          'user-agent': USER_AGENT,
        },
      }),
    }),

    // Update user avatar
    updateAvatar: builder.mutation<
      {
        status: 'success' | 'error';
        message: string;
        data: User;
        meta: null;
      },
      { avatarUri: string }
    >({
      query: ({ avatarUri }) => {
        // Extract filename from URI or use default
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const formData = new FormData();
        // React Native FormData format - file must be in the body
        // The object structure is required for React Native
        formData.append('avatar', {
          uri: avatarUri,
          type: type,
          name: filename,
        } as any);

        console.log('FormData created:', {
          hasFormData: formData instanceof FormData,
          formDataKeys: (formData as any)._parts ? (formData as any)._parts.map((p: any) => p[0]) : 'no parts',
          avatarUri: avatarUri,
          filename: filename,
          type: type,
        });

        return {
          url: '/user/avatar/update',
          method: 'POST',
          data: formData,
          // Mark as FormData explicitly for axiosBaseQuery
          isFormData: true,
          headers: {
            'x-yellpay-key': YELLPAY_API_KEY,
            'user-agent': USER_AGENT,
            'Accept': 'application/json',
            // Don't set Content-Type - let axios set it automatically with boundary for FormData
          },
        };
      },
      invalidatesTags: ['Profile'],
    }),

    updateUserProfile: builder.mutation<
      {
        status: 'success' | 'error';
        message: string;
        data: string;
        meta: null;
      },
      {
        name: string;
        furigana: string;
        phone_number: string;
        email: string;
        occupation: string;
        postal_code: string;
        prefecture: string;
        city: string;
        street_number: string;
        support_classification?: string;
        building_name?: string;
        referrer_code?: string;
      }
    >({
      query: body => ({
        url: '/user/profile/update',
        method: 'POST',
        data: body,
        headers: {
          'x-yellpay-key': YELLPAY_API_KEY,
          'user-agent': USER_AGENT,
          'Accept': 'application/json',
        },
      }),
      invalidatesTags: ['Profile'],
    }),

    // Update SDK ID for user
    updateSdkId: builder.mutation<
      {
        status: 'success' | 'error';
        message: string;
        data: {
          yellpayUserID: string;
          user: User;
        };
        meta: null;
      },
      {
        yellpayUserId: string;
        sdkid: string;
      }
    >({
      query: ({ yellpayUserId, sdkid }) => {
        const requestData = {
          sdkid: sdkid,
        };
        console.log('📤 Update SDK ID Request:', {
          url: `/user/yellpay-user-id`,
          method: 'POST',
          body: requestData,
          sdkid: sdkid,
        });
        return {
          url: `/user/yellpay-user-id`,
          method: 'POST',
          data: requestData,
          headers: {
            'x-yellpay-key': YELLPAY_API_KEY,
            'user-agent': USER_AGENT,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { 
  useGetProfileQuery, 
  useRegisterUserMutation, 
  useCheckPhoneNumberMutation, 
  usePhoneRegisterMutation, 
  useRequestOtpMutation, 
  useVerifyOtpMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useDeleteUserMutation,
  useUpdateAvatarMutation,
  useUpdateUserProfileMutation,
  useUpdateSdkIdMutation
} = appApi;
