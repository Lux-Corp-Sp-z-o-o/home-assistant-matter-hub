import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#1B6B3A" },
        secondary: { main: "#4DB6AC" },
        background: {
          default: "#F5F7F5",
          paper: "#FFFFFF",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4CAF50" },
        secondary: { main: "#80CBC4" },
        background: {
          default: "#0E1117",
          paper: "#161B22",
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});
