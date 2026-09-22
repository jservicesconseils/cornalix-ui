import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Thème PrimeNG dérivé d'Aura, recalé sur la palette Cornalix
 * (même palette que la maquette Design canvas : teal #0E7C6E / #0A5C52).
 */
export const CornalixPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E6F3F1',
      100: '#C3E4DF',
      200: '#9CD3CB',
      300: '#74C1B6',
      400: '#4BA79A',
      500: '#0E7C6E',
      600: '#0A5C52',
      700: '#084A42',
      800: '#063832',
      900: '#042621',
      950: '#021512',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#FFFFFF',
          50: '#F1F5F3',
          100: '#E6ECE9',
          200: '#CBD8D2',
          300: '#A9BDB5',
          400: '#8AA39A',
          500: '#7C928D',
          600: '#5F7570',
          700: '#48605C',
          800: '#2E413E',
          900: '#132523',
          950: '#0A1614',
        },
        primary: {
          color: '#0E7C6E',
          contrastColor: '#FFFFFF',
          hoverColor: '#0A5C52',
          activeColor: '#084A42',
        },
        highlight: {
          background: '#DCEFEA',
          focusBackground: '#C3E4DF',
          color: '#0A5C52',
          focusColor: '#0A5C52',
        },
      },
    },
  },
});
