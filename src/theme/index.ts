import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#5D4037',
      light: '#8D6E63',
      dark: '#3E2723',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#B8860B',
      light: '#DAA520',
      dark: '#8B6914',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAF6F0',
      paper: '#FFFFFF',
    },
    error: {
      main: '#C62828',
    },
    warning: {
      main: '#EF6C00',
    },
    success: {
      main: '#2E7D32',
    },
    info: {
      main: '#0277BD',
    },
  },
  typography: {
    fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    h6: {
      fontFamily: '"Playfair Display", "Noto Serif SC", serif',
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(93, 64, 55, 0.08)',
          border: '1px solid rgba(93, 64, 55, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#5D4037',
          '& .MuiTableCell-head': {
            color: '#ffffff',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(93, 64, 55, 0.03)',
          },
          '&:hover': {
            backgroundColor: 'rgba(184, 134, 11, 0.06) !important',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderLeft: '2px solid #5D4037',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});
