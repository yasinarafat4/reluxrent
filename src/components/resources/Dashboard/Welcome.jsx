// import { Box, Card, CardActions, Typography } from '@mui/material';
// import { useTranslate } from 'react-admin';

// const Welcome = () => {
//   const translate = useTranslate();
//   return (
//     <Card
//       sx={{
//         background: (theme) => `linear-gradient(45deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.light} 50%, ${theme.palette.primary.dark} 100%)`,
//         color: (theme) => theme.palette.primary.contrastText,
//         padding: '20px',
//         marginTop: 2,
//         marginBottom: '1em',
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//         }}
//       >
//         <Box
//           sx={{
//             flex: '1',
//           }}
//         >
//           <Typography variant="h5" component="h2" gutterBottom>
//             {translate('Welcome to the Admin Panel')}
//           </Typography>
//           <Box
//             sx={{
//               maxWidth: '40em',
//             }}
//           >
//             <Typography variant="body1" component="p" gutterBottom>
//               {translate('This is your custom dashboard. You can add charts, stats, quick links, or recent activities here.')}
//             </Typography>
//           </Box>
//           <CardActions
//             sx={{
//               padding: { xs: 0, xl: null },
//               flexWrap: { xs: 'wrap', xl: null },
//               '& a': {
//                 marginTop: { xs: '1em', xl: null },
//                 marginLeft: { xs: '0!important', xl: null },
//                 marginRight: { xs: '1em', xl: null },
//               },
//             }}
//           ></CardActions>
//         </Box>
//         <Box
//           sx={{
//             display: { xs: 'none', sm: 'none', md: 'block' },
//             width: '16em',
//             height: '9em',
//             overflow: 'hidden',
//             // background: `url(${publishArticleImage}) top right / cover`,
//             marginLeft: 'auto',
//           }}
//         />
//       </Box>
//     </Card>
//   );
// };

// export default Welcome;
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import { Box, Button, Card, CardActions, Typography } from '@mui/material';
import { useTranslate } from 'react-admin';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const translate = useTranslate();
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
        color: '#fff',
        p: 4,
        borderRadius: 3,
        boxShadow: '0 8px 25px rgba(0,0,0,0.18)',
        mt: 1,
      }}
    >
      <Box display="flex" alignItems="center" gap={3}>
        {/* Left Content */}
        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={1.2} mb={1.5}>
            <EmojiObjectsRoundedIcon sx={{ fontSize: 34 }} />
            <Typography variant="h4" fontWeight="600">
              {translate('Welcome to the Admin Panel')}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ maxWidth: '38em', opacity: 0.9, lineHeight: 1.7 }}>
            {translate('This is your custom dashboard. You can add charts, statistics, shortcuts, or recent activities to manage your system efficiently.')}
          </Typography>

          <CardActions sx={{ mt: 2, px: 0 }}>
            <Button variant="contained" color="secondary" onClick={() => navigate('/properties')} sx={{ borderRadius: 2, px: 3, py: 1 }}>
              {translate('Get Started')}
            </Button>
          </CardActions>
        </Box>

        {/* Right Side Graphic (optional) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '180px',
            height: '120px',
            opacity: 0.8,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))',
          }}
        />
      </Box>
    </Card>
  );
};

export default Welcome;
