import { useTheme } from '@mui/material/styles';

const Logo = (props) => {
  const theme = useTheme();
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="225" height="50">
      <text x="50" y="35" fontFamily="Permanent Marker" fontSize="30" fill="rgb(180, 140, 255)">
        ReluxRent
      </text>
    </svg>
  );
};

export default Logo;
