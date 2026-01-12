import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import logo from '../../../public/images/logos/reluxrent-logo.png';

export default function AgreeAndContinuePopup({ closeModal, showModal, setShowAgreeAndContinuePopup }) {
  const { trans } = useTranslation();

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', sm: 0 },
          width: '100%',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogContent>
        <Card
          variant="outlined"
          sx={{
            // maxWidth: 500,
            mx: 'auto',
            p: { xs: 1, sm: 3 },
          }}
        >
          <CardContent>
            {/* Logo */}
            <Box textAlign="center">
              <Box component="img" src={logo.src} alt="Logo" sx={{ width: 125, height: 42 }} />
            </Box>

            {/* Title */}
            <Typography variant="caption" fontWeight={600}>
              Our community commitment
            </Typography>

            <Typography variant="h6" fontWeight={700} mt={1}>
              ReluxRent is a community where anyone can belong
            </Typography>

            <Typography variant="body2" mt={2}>
              To ensure this, we’re asking you to commit to the following:
            </Typography>

            <Typography variant="body2" mt={1}>
              I agree to treat everyone in the ReluxRent community — regardless of their race, religion, national origin, ethnicity, disability, sex, gender identity, sexual orientation, or age — with
              respect, and without judgment or bias.
            </Typography>
          </CardContent>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              // onClick={onAgree}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                bgcolor: '#ff385c',
                '&:hover': {
                  bgcolor: '#e03252',
                },
                borderRadius: 1,
                py: 1.5,
                fontSize: 15,
              }}
            >
              Agree and continue
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={closeModal}
              sx={{
                mt: 1,
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 1,
                py: 1.5,
                fontSize: 15,
                color: 'black',
                borderColor: 'grey.400',
                '&:hover': {
                  borderColor: 'grey.500',
                  bgcolor: 'grey.100',
                },
              }}
            >
              Decline
            </Button>
          </Box>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
