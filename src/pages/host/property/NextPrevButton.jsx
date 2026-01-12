import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button } from '@mui/material';
import { blue } from '@mui/material/colors';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';

const NextPrevButton = ({ loading, propertyData, watchSelected }) => {
  const { trans } = useTranslation();
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: '9999',
        gap: 2,
        px: { xs: 2, md: 4 },
        py: 2,
      }}
    >
      <Button
        component={Link}
        href={`/host/property/${id}/edit/${propertyData.prevStep}`}
        size="small"
        startIcon={<ChevronsLeft />}
        variant="outlined"
        sx={[
          (theme) => ({
            borderRadius: 1,
            textTransform: 'none',
            px: 2,
          }),
          (theme) => theme.applyStyles('dark', {}),
        ]}
      >
        {trans('Back')}
      </Button>
      <Button
        type="submit"
        size="small"
        loading={loading}
        loadingPosition="end"
        endIcon={<ChevronsRight />}
        disabled={!watchSelected}
        sx={[
          (theme) => ({
            borderRadius: 1,
            textTransform: 'none',
            px: 2,
            color: theme.palette.grey[100],
            bgcolor: blue[600],
            '&.Mui-disabled': {
              pointerEvents: 'auto',
              cursor: 'not-allowed',
              bgcolor: theme.palette.grey[600],
              color: theme.palette.grey[100],
              opacity: 0.7,
            },
          }),
          (theme) =>
            theme.applyStyles('dark', {
              '&:hover': {
                bgcolor: blue[700],
              },
            }),
        ]}
      >
        {trans('Next')}
      </Button>
    </Box>
  );
};

export default NextPrevButton;
