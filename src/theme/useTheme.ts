import { useColorScheme } from 'react-native';
import { useSessionStore } from '@/store/session';
import { type ColorScheme, type Palette, palettes } from './palettes';

/** The active scheme: the user's choice in Account, else the system appearance. */
export function useTheme(): { scheme: ColorScheme; colors: Palette } {
  const system = useColorScheme();
  const preference = useSessionStore((state) => state.themePreference);
  const scheme: ColorScheme = preference ?? (system === 'dark' ? 'dark' : 'light');
  return { scheme, colors: palettes[scheme] };
}

/**
 * Wraps a `StyleSheet.create` factory: both sheets are built once at import, the hook picks the
 * active one, so a theme switch costs no style work on render.
 */
export function makeStyles<T>(factory: (colors: Palette) => T): () => T {
  const sheets = { light: factory(palettes.light), dark: factory(palettes.dark) };
  return function useStyles() {
    return sheets[useTheme().scheme];
  };
}
