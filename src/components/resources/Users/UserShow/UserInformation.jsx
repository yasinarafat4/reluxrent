import { Box, Divider, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { BanknoteArrowDown, BanknoteArrowUp, CalendarDays, CircleOff, Headset, IdCard, Mail, MailCheck, PhoneIcon, ShieldCheck, UserIcon } from 'lucide-react';
// import { CalendarIcon, EmailIcon, PhoneIcon, UserIcon, VerifiedIcon } from 'lucide-react';
import { useRecordContext } from 'react-admin';

const UserInformation = () => {
  const record = useRecordContext();
  console.log('UserShowRecord', record);

  return (
    <Box>
      {/* Primary Info Section */}

      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: 2,
            flexShrink: 0,
          }}
        >
          <img
            src={record?.image?.src || '/images/placeholders/user-placeholder.jpg'}
            height={120}
            width={120}
            style={{ objectFit: 'cover' }}
            alt={record?.name || 'Avatar'}
          />
        </Box>

        <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
          <Typography fontSize={15} fontWeight={600} mb={0.5}>
            Personal Info
          </Typography>
          {record?.name && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <UserIcon size={18} />
              <Typography fontSize={14} fontWeight={500}>
                {record?.name}
              </Typography>
            </Stack>
          )}

          {record?.email && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Mail size={18} />
              <Typography fontSize={14}>{record?.email}</Typography>
            </Stack>
          )}

          {record?.emailVerified && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <MailCheck size={18} />
              <Typography fontSize={14}>Email Verified: {format(record.emailVerified, 'dd-MM-yyyy')}</Typography>
            </Stack>
          )}

          {record?.phone && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <PhoneIcon size={18} />
              <Typography fontSize={14}>{record?.phone}</Typography>
            </Stack>
          )}

          {record?.id && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <IdCard size={18} />
              <Typography fontSize={14}>ID: {record?.id}</Typography>
            </Stack>
          )}
        </Stack>

        <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
          <Typography fontSize={15} fontWeight={600} mb={0.5}>
            Overview
          </Typography>
          {record?.dob && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarDays size={18} />
              <Typography fontSize={14}>DOB: {format(record.dob, 'dd-MM-yyyy')}</Typography>
            </Stack>
          )}

          {record?.guestFee && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <BanknoteArrowUp size={18} />
              <Typography fontSize={14}>Guest Fee: {record?.guestFee}</Typography>
            </Stack>
          )}

          {record?.hostFee && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <BanknoteArrowDown size={18} />
              <Typography fontSize={14}>Host Fee: {record?.hostFee}</Typography>
            </Stack>
          )}

          {record?.isHost !== undefined && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Headset size={18} />
              <Typography fontSize={14}>Host Status: {record.isHost ? 'Yes' : 'No'}</Typography>
            </Stack>
          )}

          {record?.isVerified !== undefined && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <ShieldCheck size={18} />
              <Typography fontSize={14}>Verified: {record.isVerified ? 'Yes' : 'No'}</Typography>
            </Stack>
          )}

          {record?.isDeactivated !== undefined && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircleOff size={18} />
              <Typography fontSize={14}>Deactivated: {record.isDeactivated ? 'Yes' : 'No'}</Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      {(record?.about || record?.dreamPlace || record?.funFact || record?.myWork) && <Divider sx={{ my: 2 }} />}

      {/* Additional Info Section */}
      <Stack direction={{ xs: 'column' }} alignItems="start" spacing={0.5}>
        {record?.about && (
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              About
            </Typography>
            <Typography width={'50%'} fontSize={14} sx={{ whiteSpace: 'pre-wrap' }}>
              <span
                dangerouslySetInnerHTML={{
                  __html: record?.about || 'No information provided.',
                }}
              />
            </Typography>
          </Stack>
        )}

        {record?.dreamPlace && (
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              Dream Place
            </Typography>
            <Typography fontSize={14}>{record?.dreamPlace}</Typography>
          </Stack>
        )}

        {record?.funFact && (
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              Fun Fact
            </Typography>
            <Typography fontSize={14}>{record?.funFact}</Typography>
          </Stack>
        )}

        {record?.myWork && (
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              My Work
            </Typography>
            <Typography fontSize={14}>{record?.myWork}</Typography>
          </Stack>
        )}
      </Stack>

      {(record?.languages || record?.address) && <Divider sx={{ my: 2 }} />}

      {/* Last Info Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
        {record?.languages && (
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              Languages
            </Typography>
            <Typography fontSize={14}>{record?.languages}</Typography>
          </Stack>
        )}

        {record?.address && (
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              Address
            </Typography>
            <Typography fontSize={14}>{record?.address}</Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default UserInformation;
