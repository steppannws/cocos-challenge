import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV({ id: 'cocos' });

/**
 * One synchronous string store for everything that persists: the TanStack Query cache and the
 * zustand session store both speak this getItem/setItem/removeItem shape.
 */
export const storage = {
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    mmkv.set(key, value);
  },
  removeItem: (key: string): void => {
    mmkv.remove(key);
  },
};
