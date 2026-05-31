import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, DataExport, LoginCredentials, PrivacySettings, RegisterData, User } from '../../types/auth';
import authService from '../../services/auth.service';

const initialState: AuthState = {
  user: null,
  token: authService.getStoredToken(),
  privacy: null,
  exportData: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    return await authService.login(credentials);
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData) => {
    return await authService.register(data);
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    return await authService.getCurrentUser();
  }
);

export const updateProfile = createAsyncThunk<User, Partial<User>>(
  'auth/updateProfile',
  async (profileData) => {
    return await authService.updateProfile(profileData);
  }
);

export const getPrivacySettings = createAsyncThunk<PrivacySettings>(
  'auth/getPrivacySettings',
  async () => {
    return await authService.getPrivacySettings();
  }
);

export const updatePrivacySettings = createAsyncThunk<PrivacySettings, Partial<PrivacySettings>>(
  'auth/updatePrivacySettings',
  async (settings) => {
    return await authService.updatePrivacySettings(settings);
  }
);

export const exportUserData = createAsyncThunk<DataExport>(
  'auth/exportUserData',
  async () => {
    return await authService.exportData();
  }
);

export const deleteUserData = createAsyncThunk<PrivacySettings>(
  'auth/deleteUserData',
  async () => {
    return await authService.deleteData();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.privacy = null;
        state.exportData = null;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update profile';
      })
      // Privacy
      .addCase(getPrivacySettings.fulfilled, (state, action) => {
        state.privacy = action.payload;
      })
      .addCase(getPrivacySettings.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch privacy settings';
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.privacy = action.payload;
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update privacy settings';
      })
      .addCase(exportUserData.fulfilled, (state, action) => {
        state.exportData = action.payload;
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to export data';
      })
      .addCase(deleteUserData.fulfilled, (state, action) => {
        state.privacy = action.payload;
      })
      .addCase(deleteUserData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete data';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 
