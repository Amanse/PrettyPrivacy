import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    primary: '#007AFF', // iOS Blue
    background: '#F2F2F7', // iOS System Gray 6
    surface: '#FFFFFF',
    text: '#000000',
    border: '#C7C7CC',
    error: '#FF3B30',
    placeholder: '#8E8E93',
  },
  dark: {
    primary: '#0A84FF', // iOS Dark Mode Blue
    background: '#000000',
    surface: '#1C1C1E', // iOS System Gray 6 Dark
    text: '#FFFFFF',
    border: '#38383A',
    error: '#FF453A',
    placeholder: '#8E8E93',
  },
};

export function useThemeColors() {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light']; // Default to light if null, or dark? Old app was dark only.
  // Let's stick to system preference but default to dark if user wants strict parity.
  // Actually, previous app forced MD3DarkTheme. I should arguably default to Dark if scheme is null, or just respect system.
}
