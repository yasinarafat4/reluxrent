import Layout from '@/components/layout/front/Layout';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button, Divider, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Star } from 'lucide-react';
import Link from 'next/link';

const About = () => {
  const { trans } = useTranslation();
  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: { xs: 2, md: 20 } }}>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'space-between', md: 'start' } }}>
          <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{trans('About me')}</Typography>
          <Button component={Link} href="/user/profile/edit" size="small">
            {trans('Edit')}
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 1, md: 3 },
          }}
        >
          {/* Profile Card */}
          <Card
            sx={{
              minWidth: 275,
              p: 3,
              textAlign: 'center',
            }}
            elevation={4}
          >
            <CardContent>
              <Box
                component="img"
                src="/images/placeholder/user-placeholder.jpg"
                alt="Profile"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  mx: 'auto',
                }}
              />
              <Typography sx={{ fontSize: 25, fontWeight: 700 }}>Arafat</Typography>
              <Typography variant="body2">{trans('Guest')}</Typography>
            </CardContent>
          </Card>

          {/* Edit Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: { xs: 'center', md: 'start' },
              alignItems: { xs: 'center', md: 'start' },
              textAlign: { xs: 'center', md: 'start' },
              gap: { xs: 1, md: 2 },
            }}
          >
            <Typography variant="h6">{trans('Welcome Back!')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {trans('You can manage your account and settings here. Complete yours to help other hosts and guests get to know you.')}
            </Typography>
            <Button component={Link} href="/user/profile/edit" variant="contained" color="primary">
              {trans('Get Started')}
            </Button>
          </Box>
        </Box>
        <Divider />
        <Button
          sx={{
            color: 'grey.600',
            borderColor: 'grey.400',
            '&:hover': {
              borderColor: 'grey.600',
              color: 'grey.800',
            },
            width: { xs: '100%', sm: '60%', md: '40%' },
          }}
          startIcon={<Star color="#FAAF00" />}
          variant="outlined"
        >
          {trans("Reviews I've Written")}
        </Button>
      </Box>
    </Layout>
  );
};

export default About;
