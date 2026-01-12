import GuestLayout from '@/components/layout/guest/GuestLayout';
import HostingLayout from '@/components/layout/host/HostingLayout';
import { fetcher } from '@/lib/fetcher';
import { Box, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';
import Conversations from '../partial/Conversations';
import MessageSidebar from '../partial/MessageSidebar';

const MessageDetails = () => {
  const router = useRouter();
  const { messageType } = router.query;
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { data: conversations, isLoading } = useSWR(`/api/conversations`, fetcher);

  const LayoutComponent = !isXs ? (messageType === 'host' ? HostingLayout : GuestLayout) : React.Fragment;

  if (isLoading) {
    return null;
  }
  return (
    <LayoutComponent>
      <Box display="flex" flex={1} minHeight={0} overflow="hidden">
        {/* Sidebar */}
        {!isXs && (
          <Box width={{ xs: '100%', md: '30%', lg: '25%' }} sx={{ overflowY: 'auto' }}>
            <MessageSidebar conversations={conversations} />
          </Box>
        )}

        {/* Conversations */}
        <Box flex={1} minHeight={0} sx={{ overflowY: 'auto' }}>
          <Conversations />
        </Box>
      </Box>
    </LayoutComponent>
  );
};

export default MessageDetails;
