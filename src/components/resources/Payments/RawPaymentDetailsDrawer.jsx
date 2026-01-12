import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useGetOne } from 'react-admin';

const RawPaymentDetailsDrawer = ({ paymentId, setIsDrawerOpen }) => {
  const { data: paymentData, isLoading: paymentDataLoading } = useGetOne('/payments/', { id: paymentId });
  console.log(`RawPaymentDetailsDrawerData of PaymentID - ${paymentId}`, paymentData);
  const [copied, setCopied] = useState(false);

  if (paymentDataLoading) {
    return null;
  }

  const rawResponse = paymentData?.rawResponse || {};
  console.log('PaymentsRawResponse', rawResponse);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box
      sx={{
        py: 5,
        width: { xs: '100vw', sm: 400 },
        mt: { xs: 2, sm: 1 },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Payment Raw Response
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title={copied ? 'Copied!' : 'Copy JSON'}>
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setIsDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {/* JSON Details */}
      <Stack spacing={1.5} sx={{ px: 2 }}>
        {Object.entries(rawResponse).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'text.secondary' }}>
              {key}:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                ml: 1,
                wordBreak: 'break-word',
                textAlign: 'right',
                flex: 1,
              }}
            >
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default RawPaymentDetailsDrawer;
