import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../services/appApi';

export interface UserCertificateInfo {
  certificateType: string;
  status: number;
  additionalInfo: string;
}

export interface RegistrationState {
  name: string | null;
  email: string | null;
  token: string | null; // saved for all future requests
  registeredAt: string | null;
  userId: string | null;
  user: User | null; // Store complete user data
  isRegistered: boolean;
  certificates: UserCertificateInfo[]; // Store user certificates from SDK
  isAuthenticated: boolean; // Track if SDK authentication is completed
  isCardRegistered: boolean; // Track if at least one card is registered
}

const initialState: RegistrationState = {
  name: null,
  email: null,
  token: null,
  registeredAt: null,
  userId: null,
  user: null,
  isRegistered: false,
  certificates: [],
  isAuthenticated: false,
  isCardRegistered: false,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setRegistration: (
      state,
      action: PayloadAction<{ 
        name: string; 
        email: string; 
        token: string;
        user: User;
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.registeredAt = new Date().toISOString();
      state.isRegistered = true;
      // If user object has yellpay_sdk_id, sync it to userId state
      if (action.payload.user.yellpay_sdk_id) {
        state.userId = action.payload.user.yellpay_sdk_id;
      }
    },
    clearRegistration: () => initialState,
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setRegistrationError: (state, action: PayloadAction<string>) => {
      // Handle registration errors - could be used for displaying error messages
      state.isRegistered = false;
    },
    setCertificates: (state, action: PayloadAction<UserCertificateInfo[]>) => {
      state.certificates = action.payload;
      // Check if at least one card is registered (status === 1 means active/registered)
      state.isCardRegistered = action.payload.some(cert => cert.status === 1);
      console.log('state.certificates', state.certificates);
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Also update name and email from user data if available
      if (action.payload.name) {
        state.name = action.payload.name;
      }
      if (action.payload.email) {
        state.email = action.payload.email;
      }
      // Sync userId if available in user object
      if (action.payload.yellpay_sdk_id) {
        state.userId = action.payload.yellpay_sdk_id;
      }
    },
  },
});

export const { setRegistration, clearRegistration, setUserId, setRegistrationError, setCertificates, setAuthenticated, setUser } =
  registrationSlice.actions;
export default registrationSlice.reducer;
