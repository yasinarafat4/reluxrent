import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Typography } from '@mui/material';
const NoDataFound = ({ title, subtitle }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={0.5} my={10}>
      <ErrorOutlineIcon
        sx={{
          fontSize: 50,
          color: 'primary.main',
        }}
      />
      <Typography variant="h6" color="text.secondary" textAlign="center">
        {title}
      </Typography>
      <Typography variant="body2" textAlign="center" width={{ xs: '100%', md: '80%' }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default NoDataFound;
