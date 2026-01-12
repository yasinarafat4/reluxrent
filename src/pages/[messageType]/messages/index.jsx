import GuestLayout from '@/components/layout/guest/GuestLayout';
import HostingLayout from '@/components/layout/host/HostingLayout';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import MessageSidebar from './partial/MessageSidebar';

export default function Messages() {
  const { user } = useAuth();
  const { trans } = useTranslation();
  const router = useRouter();
  const { messageType } = router.query;
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { data: conversations, isLoading, error } = useSWR(`/api/conversations`, fetcher);
  const MessageLayout = messageType == 'host' ? HostingLayout : GuestLayout;

  if (isLoading || !user) {
    return null;
  }

  return (
    <MessageLayout>
      <Box display="flex" height="100vh">
        {/* Sidebar */}
        <Box width={{ xs: '100%', md: '30%', lg: '25%' }}>
          <MessageSidebar conversations={conversations} />
        </Box>

        {/* Right Side */}
        {!isXs && (
          <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            <Typography variant="h2" color="text.secondary" fontWeight={500}>
              {trans('Start a new conversation')}
            </Typography>
          </Box>
        )}
      </Box>
    </MessageLayout>
  );
}
