import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '@services/auth.service';
import { GoogleAuthProvider, UserCredential } from 'firebase/auth';

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

// Async thunk for Google Sign In
export const signInWithGoogle = createAsyncThunk(
    'auth/signInWithGoogle',
    async (credential: any) => {
        try {
            const userCredential =
                await AuthService.signInWithGoogleCredential(credential);
            return {
                user: userCredential.user,
                token: await userCredential.user.getIdToken()
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
);

// Async thunk for Email/Password Sign In
export const signInWithEmailPassword = createAsyncThunk(
    'auth/signInWithEmailPassword',
    async (credentials: { email: string; password: string }) => {
        try {
            const userCredential =
                await AuthService.signInWithEmailAndPassword(credentials);
            return {
                user: userCredential.user,
                token: await userCredential.user.getIdToken()
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
);

// Async thunk for Email/Password Registration
export const registerWithEmailPassword = createAsyncThunk(
    'auth/registerWithEmailPassword',
    async (credentials: { email: string; password: string }) => {
        try {
            const userCredential =
                await AuthService.registerWithEmailAndPassword(credentials);
            return {
                user: userCredential.user,
                token: await userCredential.user.getIdToken()
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
);

// Async thunk for Sign Out
export const signOut = createAsyncThunk('auth/signOut', async () => {
    await AuthService.signOut();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
        },
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Google Sign In
        builder
            .addCase(signInWithGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInWithGoogle.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signInWithGoogle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Google sign in failed';
            });

        // Email/Password Sign In
        builder
            .addCase(signInWithEmailPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInWithEmailPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signInWithEmailPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Sign in failed';
            });

        // Email/Password Registration
        builder
            .addCase(registerWithEmailPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerWithEmailPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerWithEmailPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Registration failed';
            });

        // Sign Out
        builder.addCase(signOut.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        });
    }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
