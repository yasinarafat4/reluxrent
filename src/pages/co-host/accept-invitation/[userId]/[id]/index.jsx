import HostingLayout from '@/components/layout/host/HostingLayout';
import { useAuth } from '@/contexts/authContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import useSWR from 'swr';

const AcceptInvitation = () => {
  const router = useRouter();
  console.log('router', router);
  const { userId, id } = router.query;
  const { user } = useAuth();

  const { data: isCoHost } = useSWR(`/api/host/is-cohost/${id}`, fetcher);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }

    if (isCoHost && isCoHost.status == 'ACCEPTED') {
      router.push('/host/listings?type=home&status=All');
    }
  }, [user, isCoHost]);

  const handleAccept = async () => {
    try {
      await api.post(`/api/host/accept-cohost-invite`, { id: id });
      enqueueSnackbar('Invitation accepted successfully!', { variant: 'success' });
      router.push('/host/listings?type=home&status=All');
    } catch (err) {
      enqueueSnackbar('Failed to accept invitation', { variant: 'error' });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <HostingLayout>
      <Box
        sx={{
          minHeight: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'background.default',
          p: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 3,
            boxShadow: 3,
            textAlign: 'center',
          }}
        >
          {userId == user?.id ? (
            <CardContent sx={{ p: 4 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />

              <Typography variant="h5" fontWeight={600} gutterBottom>
                Accept Co-Host Invitation
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={4}>
                You've been invited to join as a co-host. Click the button below to accept and start managing properties together.
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleAccept}
                sx={{
                  borderRadius: 2,
                  py: 1.4,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Accept Invitation
              </Button>
            </CardContent>
          ) : (
            <CardContent sx={{ p: 2 }}>
              <ErrorOutlineIcon
                sx={{
                  fontSize: 70,
                  mb: 1,
                  color: 'primary.main',
                }}
              />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                You are unable to accept this invite
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                The email on your account doesn't match with the invite. Please ask to be invited at <strong>{user?.email}</strong>
              </Typography>
            </CardContent>
          )}
        </Card>
      </Box>
    </HostingLayout>
  );
};

export default AcceptInvitation;
