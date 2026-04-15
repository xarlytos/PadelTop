import { create } from 'zustand';
import { setAuthToken } from '../api/client';
import { getSupabase } from '../lib/supabase';
import { CONFIG } from '../constants/config';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  setMockUser: () => void;
}

function setToken(token: string | null) {
  setAuthToken(token);
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  init: async () => {
    if (CONFIG.USE_MOCKS) return;

    const { data } = await getSupabase().auth.getSession();
    if (data.session) {
      const { user, access_token } = data.session;
      setToken(access_token);
      set({
        user: {
          id: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
        },
        token: access_token,
        isAuthenticated: true,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    if (CONFIG.USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 500));
      const token = `mock-token-${Date.now()}`;
      setToken(token);
      set({
        user: { id: '1', email, displayName: email.split('@')[0] },
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      throw error;
    }

    const session = data.session;
    const user = data.user;
    if (session && user) {
      setToken(session.access_token);
      set({
        user: {
          id: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
        },
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
      throw new Error('No session returned');
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true });

    if (CONFIG.USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 500));
      const token = `mock-token-${Date.now()}`;
      setToken(token);
      set({
        user: { id: '1', email, displayName: email.split('@')[0] },
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) {
      set({ isLoading: false });
      throw error;
    }

    const session = data.session;
    const user = data.user;
    if (session && user) {
      setToken(session.access_token);
      set({
        user: {
          id: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
        },
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
      throw new Error('No session returned');
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 500));
    const token = `mock-google-token-${Date.now()}`;
    setToken(token);
    set({
      user: { id: '2', email: 'google@example.com', displayName: 'Google User' },
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  loginWithApple: async () => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 500));
    const token = `mock-apple-token-${Date.now()}`;
    setToken(token);
    set({
      user: { id: '3', email: 'apple@example.com', displayName: 'Apple User' },
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    set({ isLoading: true });

    if (!CONFIG.USE_MOCKS) {
      await getSupabase().auth.signOut();
    }

    setToken(null);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setMockUser: () => {
    const token = `mock-demo-token-${Date.now()}`;
    setToken(token);
    set({
      user: { id: 'mock', email: 'demo@padel.app', displayName: 'Demo User' },
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },
}));
