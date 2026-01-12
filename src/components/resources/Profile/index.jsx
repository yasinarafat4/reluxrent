import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { BadgeCheck, CalendarPlus, Mail, Phone, Shield } from 'lucide-react';
import { useGetIdentity, useGetOne } from 'react-admin';
import Avatar from 'react-avatar';

const Profile = () => {
  const { data: stafData, isLoading: stafDataLoading } = useGetIdentity();
  const { data, isLoading } = useGetOne('stafs', { id: stafData?.id }, { enabled: !!stafData?.id });
  console.log('data', data);
  if (stafDataLoading || isLoading) return <Typography>Loading...</Typography>;
  if (!data) return <Typography>No profile data found</Typography>;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <Paper
        elevation={3}
        sx={{
          width: 350,
          borderRadius: 3,
          boxShadow: 3,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          {/* Profile Header */}
          <Stack alignItems="center" spacing={0} p={2}>
            <Avatar name={data.name} alt={data.name} round={true} size="90">
              {data.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Typography variant="h6" fontWeight={700}>
              {data.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {data.role?.name || 'Staff Member'}
            </Typography>
          </Stack>
          <Divider sx={{ width: '100%' }} />
          {/* Info Section */}
          <Stack spacing={2} p={2} width="100%">
            {/* Email */}
            <Stack direction="row" justifyContent={'space-between'} alignItems="center" spacing={1}>
              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <Mail size={18} color="#555" />
                <Typography fontSize={15}>Email</Typography>
              </Stack>
              <Typography fontSize={15} variant="body1">{data.email || 'N/A'}</Typography>
            </Stack>

            {/* Phone */}
            <Stack direction="row" justifyContent={'space-between'} alignItems="center" spacing={1}>
              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <Phone size={18} color="#555" />
                <Typography fontSize={15}>Phone</Typography>
              </Stack>
              <Typography fontSize={15} variant="body1">{data.phone || 'N/A'}</Typography>
            </Stack>

            {/* Status */}
            <Stack direction="row" justifyContent={'space-between'} alignItems="center" spacing={1}>
              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <BadgeCheck size={18} color="#555" />
                <Typography fontSize={15}>Status</Typography>
              </Stack>

              <Button size="small" variant="outlined" sx={{ borderRadius: 3, px: 1.5 , py: 0.2 }} color={data.status ? 'success' : 'error'}>
                {data.status ? 'Active' : 'Inactive'}
              </Button>
            </Stack>

            {/* Phone */}
            <Stack direction="row" justifyContent={'space-between'} alignItems="center" spacing={1}>
              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <Shield size={18} color="#555" />
                <Typography fontSize={15}>Role</Typography>
              </Stack>
              <Typography fontSize={15} variant="body1">{data.role?.name}</Typography>
            </Stack>

            {/* Joined */}
            <Stack direction="row" justifyContent={'space-between'} alignItems="center" spacing={1}>
              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <CalendarPlus size={18} color="#555" />
                <Typography fontSize={15}> Joined on</Typography>
              </Stack>
              <Typography fontSize={15} variant="body1">{format(data.createdAt, 'dd-mm-yyyy')}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
