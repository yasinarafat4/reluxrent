import { createTheme } from '@mui/material';
import { Poppins, Sansita } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});
const sansita = Sansita({
  weight: ['400', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});
export const getTheme = (mode) => {
  return createTheme({
    palette: {
      mode: mode,
      common: {
        white: mode === 'dark' ? '#fafafa' : '#fff',
        black: mode === 'dark' ? '#fff' : '#000',
      },
      primary: {
        main: '#CA0A55',
      },
      secondary: {
        main: mode === 'dark' ? '#212121' : '#3F3F3F',
        dark: '#000000',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#bdbdbd' : '#616161',
        disabled: mode === 'dark' ? '#f5f5f5' : '#9e9e9e',
      },

      divider: mode === 'dark' ? '#757575' : '#e0e0e0',
      success: {
        main: '#2e7d32',
      },
      info: {
        main: '#0288d1',
      },
      warning: {
        main: '#ed6c02',
      },
      error: {
        main: '#d32f2f',
      },
      background: {
        white: mode === 'dark' ? '#212121' : '#fff',
        primary: mode === 'dark' ? '#212121' : '#fff',
        paper: mode === 'dark' ? '#212121' : '#fafafa',
        default: mode === 'dark' ? '#303030' : '#fff',
      },
      action: {
        active: 'rgba(0, 0, 0, 0.54)',
        hover: mode === 'dark' ? '#212121' : 'rgba(0, 0, 0, 0.08)',
        hoverOpacity: 0.04,
        selected: mode === 'dark' ? '#212121' : 'rgba(0, 0, 0, 0.08)',
        selectedOpacity: 0.08,
        disabled: 'rgba(0, 0, 0, 0.26)',
        disabledBackground: 'rgba(0, 0, 0, 0.12)',
        disabledOpacity: 0.38,
        focus: 'rgba(0, 0, 0, 0.12)',
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: `${poppins.style.fontFamily}, ${sansita.style.fontFamily}, "Helvetica", "Arial", sans-serif`,
      fontSize: 16,
      h1: {
        fontSize: '3rem', // 48px
        fontWeight: 700,
        lineHeight: 1.1,
        '@media (max-width:600px)': {
          fontSize: '2rem', // 32px
        },
      },
      h2: {
        fontSize: '2.25rem', // 36px
        fontWeight: 600,
        lineHeight: 1.2,
        '@media (max-width:600px)': {
          fontSize: '1.5rem', // 24px
        },
      },
      h3: {
        fontSize: '1.75rem', // 28px
        fontWeight: 600,
        lineHeight: 1.3,
        '@media (max-width:600px)': {
          fontSize: '1.3rem', // 20.8px
        },
      },
      h4: {
        fontSize: '1.5rem', // 24px
        fontWeight: 600,
        lineHeight: 1.35,
        '@media (max-width:600px)': {
          fontSize: '1.2rem', // 19.2px
        },
      },
      h5: {
        fontSize: '1.25rem', // 20px
        fontWeight: 600,
        lineHeight: 1.4,
        '@media (max-width:600px)': {
          fontSize: '1rem', // 16px
        },
      },
      h6: {
        fontSize: '1.1rem', // 20px
        fontWeight: 500,
        lineHeight: 1.4,
        '@media (max-width:600px)': {
          fontSize: '.97rem', // 16px
        },
      },

      //       50
      // :
      // "#fafafa"
      // 100
      // :
      // "#f5f5f5"
      // 200
      // :
      // "#eeeeee"
      // 300
      // :
      // "#e0e0e0"
      // 400
      // :
      // "#bdbdbd"
      // 500
      // :
      // "#9e9e9e"
      // 600
      // :
      // "#757575"
      // 700
      // :
      // "#616161"
      // 800
      // :
      // "#424242"
      // 900
      // :
      // "#212121"
      // A100
      // :
      // "#f5f5f5"
      // A200
      // :
      // "#eeeeee"
      // A400
      // :
      // "#bdbdbd"
      // A700
      // :
      // "#616161"
      subtitle1: {
        fontSize: '1rem', // 16px
        fontWeight: 500,
        lineHeight: 1.5,
        color: mode === 'dark' ? '#9e9e9e' : '#616161',
        '@media (max-width:600px)': {
          fontSize: '0.95rem',
        },
      },
      subtitle2: {
        fontSize: '0.875rem', // 14px
        fontWeight: 500,
        lineHeight: 1.5,
        '@media (max-width:600px)': {
          fontSize: '0.85rem',
        },
      },
      body1: {
        fontSize: '1rem', // 16px
        fontWeight: 400,
        lineHeight: 1.5,

        '@media (max-width:600px)': {
          fontSize: '0.95rem',
        },
      },
      body2: {
        fontSize: '0.875rem', // 14px
        fontWeight: 400,
        lineHeight: 1.5,
        color: mode === 'dark' ? '#bdbdbd' : '#616161',
        '@media (max-width:600px)': {
          fontSize: '0.85rem',
        },
      },
      caption: {
        fontSize: '0.75rem', // 12px
        fontWeight: 400,
        lineHeight: 1,
        '@media (max-width:600px)': {
          fontSize: '0.65rem',
        },
      },
    },
  });
};
