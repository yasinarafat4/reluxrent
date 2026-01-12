import Layout from '@/components/layout/front/Layout';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Container, IconButton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Globe, Home, HousePlus, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useRouter } from 'next/router';
import Avatar from 'react-avatar';
import useSWR from 'swr';

const ShowUserProfile = () => {
  const { trans, lang } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { actions } = usePopups();

  const { data: user } = useSWR(`/api/front/user/${id}?lang=${lang.code}`, fetcher);
  console.log('userShow', user);

  if (!user) return null;

  const joinYear = user?.createdAt ? format(new Date(user.createdAt), 'yyyy') : '2025';
  const dob = user?.dob ? format(new Date(user.dob), 'MMM dd, yyyy') : null;

  return (
    <Layout>
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 4, lg: 10 },
          py: { xs: 4, sm: 5 },
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Left Side - Avatar */}
        <Stack width={{ md: '40%' }} gap={2} justifyContent={'center'} alignItems={'center'}>
          <Box position={'relative'}>
            <Box border={'1px solid'} borderColor={'divider'} borderRadius={'100%'}>
              <Avatar src={user?.image} name={user?.name} alt={user?.name} round={true} size="200" />
            </Box>
            {user?.isVerified && (
              <IconButton
                sx={{
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  position: 'absolute',
                  bottom: 5,
                  right: 15,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <ShieldCheck />
              </IconButton>
            )}
          </Box>
          <Typography variant="h4" fontSize={20} fontWeight={500}>
            {user.preferredName || user?.name}
          </Typography>
          {/* About */}
          {user?.about && <Typography component="div" textAlign={'center'} dangerouslySetInnerHTML={{ __html: user?.about }} className="editor-content" />}
        </Stack>

        {/* Right Side - Info */}
        <Box width={{md:'60%'}}>
          <Stack gap={2}>
            <Typography variant="h2">About {user?.name}</Typography>
            <Box>
              <Stack direction={'row'} alignItems={'center'} gap={1}>
                <IconButton sx={{ color: 'text.primary' }}>
                  <Star size={18} />
                </IconButton>
                <Typography variant="body2" color="text.primary">
                  5.0 rating from 5 reviews
                </Typography>
              </Stack>

              {user?.isVerified && (
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <IconButton sx={{ color: 'text.primary' }}>
                    <ShieldCheck size={18} />
                  </IconButton>
                  <Typography variant="body2" color="text.primary">
                    Identity verified
                  </Typography>
                </Stack>
              )}

              <Stack direction={'row'} alignItems={'center'} gap={1}>
                <IconButton sx={{ color: 'text.primary' }}>
                  <HousePlus size={18} />
                </IconButton>
                <Typography variant="body2" color="text.primary">
                  Joined in {joinYear}
                </Typography>
              </Stack>

              {user?.address && (
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <IconButton sx={{ color: 'text.primary' }}>
                    <Home size={18} />
                  </IconButton>
                  <Typography variant="body2" color="text.primary">
                    Lives in {user?.address}
                  </Typography>
                </Stack>
              )}

              {user?.languages?.length > 0 && (
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <IconButton sx={{ color: 'text.primary' }}>
                    <Globe size={18} />
                  </IconButton>
                  <Typography variant="body2" color="text.primary">
                    Speaks {user.languages.join(', ')}
                  </Typography>
                </Stack>
              )}

              {dob && (
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <IconButton sx={{ color: 'text.primary' }}>
                    <Sparkles size={18} />
                  </IconButton>
                  <Typography variant="body2" color="text.primary">
                    Born on {dob}
                  </Typography>
                </Stack>
              )}
            </Box>

            {user?.funFact && (
              <Typography variant="body1" fontSize={14}>
                <strong>Fun Fact:</strong> {user.funFact}
              </Typography>
            )}

            {user?.dreamPlace && (
              <Typography variant="body1" fontSize={14}>
                <strong>Dream Place:</strong> {user.dreamPlace}
              </Typography>
            )}

            {user?.myWork && (
              <Typography variant="body1" fontSize={14}>
                <strong>Work:</strong> {user.myWork}
              </Typography>
            )}
          </Stack>
        </Box>
      </Container>
    </Layout>
  );
};

export default ShowUserProfile;
