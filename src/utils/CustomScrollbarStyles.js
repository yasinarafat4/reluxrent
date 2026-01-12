import { GlobalStyles } from '@mui/material';

const CustomScrollbarStyles = () => {
  return (
    <GlobalStyles
      styles={{
        'html, body': {
          height: '100%',
          margin: 0,
          padding: 0,
        },
        '::-webkit-scrollbar': {
          width: '6px', // Width of the scrollbar
          height: '6px', // Height of horizontal scrollbar
        },
        '::-webkit-scrollbar-track': {
          background: '#f1f1f1', // Background of the scrollbar track
          borderRadius: '5px', // Round corners of track
        },
        '::-webkit-scrollbar-thumb': {
          background: '#888', // Scrollbar thumb color
          borderRadius: '5px', // Round corners of thumb
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: '#555', // Thumb color on hover
        },
      }}
    />
  );
};

export default CustomScrollbarStyles;
