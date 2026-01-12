import GuestLayout from '@/components/layout/guest/GuestLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ReviewAbout from './ReviewAbout';
import ReviewBy from './ReviewBy';

const Reviews = () => {
  const { trans } = useTranslation();
  const [value, setValue] = useState('reviewsAboutYou');
    const router = useRouter();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const url = new URL(window.location.origin + router.asPath);
    url.searchParams.delete('page');
    router.push(url.pathname + '?' + url.searchParams.toString(), undefined, { shallow: true });
  };

  return (
    <GuestLayout>
      <Box width={{ xs: '100%', lg: '80%' }} mx="auto" p={{ xs: 2, sm: 10 }}>
        <Typography variant="h4" fontWeight={600}>
          {trans('Reviews')}
        </Typography>

        <Box mt={2}>
          <TabContext value={value}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                borderBottom: '1px solid',
                borderColor: 'divider',
                justifyContent: 'space-between',
                alignItems: { xs: 'start', sm: 'center' },
              }}
              mb={1}
              mr={'2'}
            >
              <TabList
                onChange={handleChange}
                sx={{
                  '& .MuiTabs-flexContainer': {
                    gap: 2,
                  },
                }}
              >
                <Tab label="Reviews about you" value="reviewsAboutYou" sx={{ textTransform: 'none', px: 0 }} />
                <Tab label="Reviews by you" value="reviewsByYou" sx={{ textTransform: 'none', px: 0 }} />
              </TabList>
            </Box>

            {/* Reviews about You Panel */}
            <TabPanel value="reviewsAboutYou" sx={{ p: 1 }}>
              <ReviewAbout />
            </TabPanel>

            {/* Reviews by You Panel */}
            <TabPanel value="reviewsByYou" sx={{ p: 1 }}>
              <ReviewBy />
            </TabPanel>
          </TabContext>
        </Box>
      </Box>
    </GuestLayout>
  );
};

export default Reviews;
