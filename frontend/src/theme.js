import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#006600' }, // Kenyan green
    secondary: { main: '#CC0000' }, // Kenyan red
    background: { default: '#FFFFFF', paper: '#F5F5F5' }, // White for peace
    text: { primary: '#000000' }, // Black for unity
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
});

export default theme;