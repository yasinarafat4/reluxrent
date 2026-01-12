import PropertyCard from '@/components/cards/PropertyCard';
import GuestLayout from '@/components/layout/guest/GuestLayout';
import NoDataFound from '@/components/NoDataFound';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Divider, Stack, Tab, Typography } from '@mui/material';
import { format, isToday, isYesterday } from 'date-fns';
import React, { useState } from 'react';
import useSWR from 'swr';

const Wishlists = () => {
  const { trans } = useTranslation();
  const [value, setValue] = useState('recentlyViewed');

  const { data: recentlyViewedData = [], isLoading: recentlyViewedLoading } = useSWR('/api/guest/recently-viewed', fetcher);
  const { data: wishlistsData = [], isLoading: wishlistsLoading } = useSWR('/api/guest/wishlists', fetcher);
  console.log('viewedData', recentlyViewedData);
  console.log('wishlistsData', wishlistsData);

  // useEffect(() => {
  //   if (recentlyViewedData) {
  //     const grouped = recentlyViewedData.reduce((acc, viewed) => {
  //       const dateKey = format(new Date(viewed.updatedAt), 'yyyy-MM-dd');
  //       if (!acc[dateKey]) acc[dateKey] = [];
  //       acc[dateKey].push(viewed);
  //       return acc;
  //     }, {});

  //     setViewedData(grouped);
  //   }
  // }, [recentlyViewedData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function formatViewedDate(dateString) {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  }

  return (
    <GuestLayout>
      <Container maxWidth={'xl'}>
        <Box width={'100%'} px={3} pt={2} pb={{ xs: 5, md: 2 }}>
          {/* Title */}
          <Typography variant="h5" mb={2}>
            {trans('Wishlists')}
          </Typography>

          {/* Tabs */}
          <TabContext value={value}>
            <TabList
              onChange={handleChange}
              sx={{
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '0',
                  p: 0,
                  mr: 2,
                  '&.Mui-selected': {
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                  },
                },
              }}
            >
              <Tab label="Recently Viewed" value="recentlyViewed" disableRipple />
              <Tab label="My Wishlist" value="myWishlist" disableRipple />
            </TabList>
            <Divider sx={{ mt: -0.5 }} />
            {/* Recently Viewed */}
            <TabPanel value="recentlyViewed" sx={{ px: 0 }}>
              <Box>
                {recentlyViewedData && Object.keys(recentlyViewedData).length > 0 ? (
                  Object.entries(recentlyViewedData).map(([date, viewedData]) => (
                    <React.Fragment key={date}>
                      {viewedData && Object.keys(viewedData).length > 0 ? (
                        <Stack>
                          <Typography variant="h5" color="text.primary" textAlign="start" fontWeight={600} mb={0.5}>
                            {formatViewedDate(date)}
                          </Typography>
                          <Box
                            display="grid"
                            gridTemplateColumns={{
                              xs: 'repeat(2, minmax(0, 1fr))',
                              sm: 'repeat(3, minmax(0, 1fr))',
                              md: 'repeat(4, minmax(0, 1fr))',
                              lg: 'repeat(6, minmax(0, 1fr))',
                            }}
                            width="100%"
                            gap={2}
                          >
                            {Array.isArray(viewedData)
                              ? viewedData.map((property, i) => (
                                  <Box key={i}>
                                    <PropertyCard property={property} />
                                  </Box>
                                ))
                              : Object.values(viewedData).map((property, i) => (
                                  <Box key={i}>
                                    <PropertyCard property={property} />
                                  </Box>
                                ))}
                          </Box>
                        </Stack>
                      ) : (
                        <NoDataFound title="No recently viewed properties found!" />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <NoDataFound title="No recently viewed properties found!" />
                )}
              </Box>
            </TabPanel>

            {/* My List */}
            <TabPanel value="myWishlist" sx={{ px: 0 }}>
              {wishlistsData.length > 0 ? (
                <Box
                  display={'grid'}
                  gridTemplateColumns={{
                    xs: 'repeat(2, minmax(0, 1fr))',
                    sm: 'repeat(3, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                    lg: 'repeat(6, minmax(0, 1fr))',
                  }}
                  gap={2}
                >
                  {wishlistsData.map((property, i) => (
                    <PropertyCard key={i} property={property} />
                  ))}
                </Box>
              ) : (
                <NoDataFound title={"You haven't added any properties to your wishlist yet!"} />
              )}
            </TabPanel>
          </TabContext>
        </Box>
      </Container>
    </GuestLayout>
  );
};

export default Wishlists;
