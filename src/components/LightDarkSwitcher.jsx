import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { Box, IconButton } from '@mui/material';
import { Moon, Sun } from 'lucide-react';

const LightDarkSwitcher = () => {
  const { theme, toggleTheme } = useReluxRentAppContext();

  if (!theme) return null;

  return (
    <Box>
      <IconButton onClick={toggleTheme} variant="text" size="small" sx={{ color: 'text.primary' }}>
        {theme === 'dark' ? <Sun /> : <Moon />}
      </IconButton>
    </Box>
  );
};

export default LightDarkSwitcher;
