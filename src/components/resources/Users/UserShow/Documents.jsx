import NoDataFound from '@/components/NoDataFound';
import api from '@/lib/api';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// import { CalendarIcon, EmailIcon, PhoneIcon, UserIcon, VerifiedIcon } from 'lucide-react';
import { useNotify, useRecordContext, useRefresh } from 'react-admin';

const Documents = () => {
  const record = useRecordContext();
  const [verificationData, setVerificationData] = useState();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getVerificationData = async (id) => {
      const { data } = await api.get(`/api/user/verification-documents/${id}`);
      setVerificationData(data);
    };
    getVerificationData(record.id);
  }, [record]);

  const onVerifyClick = async () => {
    setLoading(true);
    try {
      const { data } = await api.put(`/api/user/verify/${record.id}`);
      notify('User verified successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.log('Error:', error);
      notify('Error updating user verify', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     {verificationData ? <Box>
        {/* Profile Preview Section */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
          {/* Selfie or Placeholder */}
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
            <img src={verificationData?.selfie || '/images/placeholders/user-placeholder.jpg'} alt={verificationData?.name || 'User Selfie'} />
          </Box>

          {/* Basic Info */}
          <Stack alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              Verification Info
            </Typography>

            {verificationData?.name && <Typography fontSize={14}>Name: {verificationData?.name}</Typography>}
            {verificationData?.dob && <Typography fontSize={14}>Date of Birth: {format(new Date(verificationData?.dob), 'dd-MM-yyyy')}</Typography>}
            {verificationData?.idNumber && <Typography fontSize={14}>ID Number: {verificationData?.idNumber}</Typography>}
            {verificationData?.documentType && <Typography fontSize={14}>Document Type: {verificationData?.documentType}</Typography>}
            {verificationData?.updatedAt && (
              <Typography fontSize={13} color="text.secondary">
                Last Updated: {format(verificationData?.updatedAt, 'dd MMM yyyy')}
              </Typography>
            )}
          </Stack>
        </Stack>

        {verificationData?.documentType && (
          <Box>
            {(verificationData?.front || verificationData?.back || verificationData?.passport) && <Divider sx={{ my: 1 }} />}
            <Typography fontSize={15} fontWeight={600} mb={0.5}>
              Documenets:{' '}
              <Typography variant="body2" component={'span'} color="primary.main" fontWeight={600}>
                {verificationData?.documentType}
              </Typography>
            </Typography>
            {verificationData?.documentType == 'Passport' ? (
              <Stack>
                {verificationData?.passport && (
                  <Box
                    component={Link}
                    href={verificationData?.passport}
                    target="_blank"
                    sx={{
                      width: 220,
                      height: 265,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Image src={verificationData?.passport} height={265} width={220} style={{ objectFit: 'cover' }} alt={verificationData?.documentType || 'Passport'} />
                  </Box>
                )}
              </Stack>
            ) : verificationData?.documentType == 'DrivingLicense' ? (
              <Stack direction={'row'} justifyItems={'center'} gap={1}>
                {verificationData?.front && (
                  <Box
                    component={Link}
                    href={verificationData?.front}
                    target="_blank"
                    sx={{
                      width: 250,
                      height: 160,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Image src={verificationData?.front} height={250} width={160} style={{ objectFit: 'cover' }} alt={verificationData?.documentType || 'Driving License Front'} />
                  </Box>
                )}
                {verificationData?.back && (
                  <Box
                    component={Link}
                    href={verificationData?.back}
                    target="_blank"
                    sx={{
                      width: 250,
                      height: 160,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Image src={verificationData?.back} height={250} width={160} style={{ objectFit: 'cover' }} alt={verificationData?.documentType || 'Driving License Back'} />
                  </Box>
                )}
              </Stack>
            ) : (
              <Stack direction={'row'} justifyItems={'center'} gap={1}>
                {verificationData?.front && (
                  <Box
                    component={Link}
                    href={verificationData?.front}
                    target="_blank"
                    sx={{
                      width: 250,
                      height: 160,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Image src={verificationData?.front} height={250} width={160} style={{ objectFit: 'cover' }} alt={verificationData?.documentType || 'Driving License Front'} />
                  </Box>
                )}
                {verificationData?.back && (
                  <Box
                    component={Link}
                    href={verificationData?.back}
                    target="_blank"
                    sx={{
                      width: 250,
                      height: 160,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Image src={verificationData?.back} height={250} width={160} style={{ objectFit: 'cover' }} alt={verificationData?.documentType || 'Driving License Back'} />
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        )}

        {!record.isVerified && (
          <Button loading={loading} loadingPosition="end" onClick={() => onVerifyClick()} sx={{ mt: 2 }} variant="contained">
            Verify
          </Button>
        )}
      </Box> : <NoDataFound title={'No document found!'}/>}
    </>
  );
};

export default Documents;
