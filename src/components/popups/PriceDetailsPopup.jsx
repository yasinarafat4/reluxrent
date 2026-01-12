import { useTranslation } from '@/contexts/TranslationContext';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export default function PriceDetailsPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();

  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      disableScrollLock
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          m: { xs: 1, sm: 0 },
        },
      }}
    >
      <DialogContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Price details
          </Typography>
          <IconButton
            sx={[
              (theme) => ({
                transition: 'all 0.3s ease',
                color: theme.palette.grey[700],
                bgcolor: 'transparent',
                ':hover': {
                  bgcolor: theme.palette.secondary.main,
                  color: theme.palette.common.white,
                },
              }),
              (theme) =>
                theme.applyStyles('dark', {
                  // bgcolor: theme.palette.common.black,
                  // color: theme.palette.common.white,
                }),
            ]}
            size="small"
            onClick={closeModal}
          >
            <CloseIcon sx={{ fontSize: '22px' }} />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Line item 1 */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontSize={14}>2 nights · Jul 18 - 20</Typography>
          <Typography fontSize={14} fontWeight={500}>
            $47.00
          </Typography>
        </Box>

        {/* Line item 2 */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontSize={14}>ReluxRent service fee</Typography>
          <Typography fontSize={14} fontWeight={500}>
            $6.64
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Total */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontSize={14}>
            <strong>Total</strong>{' '}
            <Typography component="span" fontSize={14} fontWeight={400} sx={{ textDecoration: 'underline' }}>
              USD
            </Typography>
          </Typography>
          <Typography fontWeight="bold">$53.64</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
