import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Player } from '../types/player.types';
import { CONFIG } from '../constants/config';
import { fetchFavorites, addFavorite as addFavoriteApi, removeFavorite as removeFavoriteApi } from '../api/favorites.api';

interface FavoritePlayer extends Player {
  addedAt: string;
}

interface FavoritesState {
  favorites: FavoritePlayer[];
  isLoading: boolean;
  init: () => Promise<void>;
  addFavorite: (player: Player) => Promise<boolean>;
  removeFavorite: (playerId: string) => Promise<void>;
  isFavorite: (playerId: string) => boolean;
  canAddMore: () => boolean;
}

const MAX_FREE_FAVORITES = 2;

function mapBackendFavorite(item: any): FavoritePlayer {
  return {
    id: item.player_id,
    name: item.player_name,
    country: item.player_country || '',
    countryCode: item.player_country_code || '',
    age: item.player_age ?? undefined,
    ranking: item.player_ranking ?? undefined,
    points: item.player_points ?? undefined,
    avatarUrl: item.player_avatar_url || undefined,
    addedAt: item.created_at || new Date().toISOString(),
  };
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,

      init: async () => {
        if (CONFIG.USE_MOCKS) return;
        set({ isLoading: true });
        try {
          const data = await fetchFavorites();
          const favorites = (data || []).map(mapBackendFavorite);
          set({ favorites });
        } catch {
          // keep persisted local state on error
        } finally {
          set({ isLoading: false });
        }
      },

      addFavorite: async (player: Player) => {
        const current = get().favorites;
        if (current.some((f) => f.id === player.id)) {
          return true;
        }

        if (CONFIG.USE_MOCKS) {
          if (current.length >= MAX_FREE_FAVORITES) {
            return false;
          }
          set({
            favorites: [...current, { ...player, addedAt: new Date().toISOString() }],
          });
          return true;
        }

        try {
          await addFavoriteApi({
            player_id: player.id,
            player_name: player.name,
            player_avatar_url: player.avatarUrl,
          });
          set({
            favorites: [...current, { ...player, addedAt: new Date().toISOString() }],
          });
          return true;
        } catch (err: any) {
          if (err?.response?.status === 403) {
            return false;
          }
          throw err;
        }
      },

      removeFavorite: async (playerId: string) => {
        if (CONFIG.USE_MOCKS) {
          set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== playerId),
          }));
          return;
        }

        try {
          await removeFavoriteApi(playerId);
          set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== playerId),
          }));
        } catch {
          // keep local state on error
        }
      },

      isFavorite: (playerId: string) => {
        return get().favorites.some((f) => f.id === playerId);
      },

      canAddMore: () => {
        return get().favorites.length < MAX_FREE_FAVORITES;
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
