import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../services/appApi';

export interface RegistrationState {
  name: string | null;
  email: string | null;
  token: string | null; // saved for all future requests
  registeredAt: string | null;
  userId: string | null;
  user: User | null; // Store complete user data
  isRegistered: boolean;
}

const initialState: RegistrationState = {
  name: null,
  email: null,
  token: null,
  registeredAt: null,
  userId: null,
  user: null,
  isRegistered: false,
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
    },
    clearRegistration: () => initialState,
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setRegistrationError: (state, action: PayloadAction<string>) => {
      // Handle registration errors - could be used for displaying error messages
      state.isRegistered = false;
    },
  },
});

export const { setRegistration, clearRegistration, setUserId, setRegistrationError } =
  registrationSlice.actions;
export default registrationSlice.reducer;
