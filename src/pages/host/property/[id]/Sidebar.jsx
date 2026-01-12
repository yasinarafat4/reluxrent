import { useAuth } from '@/contexts/authContext';
import { fetcher } from '@/lib/fetcher';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Stack, Tab, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const Sidebar = ({ id }) => {
  const router = useRouter();
  const { user } = useAuth();
  const initialTab = router?.query?.tab === 'arrival' ? 'arrival' : 'space';
  const [value, setValue] = useState(initialTab);
  const [coHost, setCoHost] = useState();

  const { data: cohostsData = [], isLoading: cohostsDataLoading } = useSWR(`/api/host/cohosts/${id}`, fetcher);

  useEffect(() => {
    const isUserCohost = cohostsData?.find((cohost) => cohost?.userId === user?.id);
    setCoHost(isUserCohost);
  }, [cohostsData]);

  console.log('coHost', coHost);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const isDesktop = window.innerWidth > 768;
    
    // Default basePath
    let basePath = '';
    if (isDesktop) {
      basePath = newValue === 'arrival' ? `/host/property/${id}/edit/check-in-out` : `/host/property/${id}/edit/property-type`;
    } else {
      basePath = newValue === 'arrival' ? `/host/property/${id}` : `/host/property/${id}`;
    }

    router.replace(
      {
        pathname: basePath,
        query: { tab: newValue },
      },
      undefined,
      { shallow: false },
    );
  };

  const spaceItems = [
    {
      label: 'Property Type',
      href: `property-type`,
      subtitle: 'Choose the type of your property.',
    },
    {
      label: 'Space Type',
      href: `space-type`,
      subtitle: 'Define the space guests will have access to.',
    },
    {
      label: 'Location',
      href: `location`,
      subtitle: 'Set the map location and address.',
    },
    {
      label: 'Floor Plan',
      href: `floor-plan`,
      subtitle: 'Add layout information and bed details.',
    },
    {
      label: 'Amenities',
      href: `amenities`,
      subtitle: 'Select what amenities you offer to guests.',
    },
    {
      label: 'Photos',
      href: `photos`,
      subtitle: 'Manage the photos that represent your space.',
    },
    {
      label: 'Title & Descriptions',
      href: `descriptions`,
      subtitle: 'Set a catchy title and detailed description.',
    },
    {
      label: 'Booking Settings',
      href: `booking-settings`,
      subtitle: 'Adjust booking rules and availability.',
    },
    {
      label: 'Price',
      href: `price`,
      subtitle: 'Set your base price and fees.',
    },
    {
      label: 'Discounts',
      href: `discounts`,
      subtitle: 'Set up weekly or monthly discounts.',
    },
    {
      label: 'Calender Settings',
      href: `calender-settings`,
      subtitle: 'Manage calendar preferences.',
    },
    {
      label: 'Co-host',
      href: `co-host`,
      subtitle: 'Invite others to help manage your listing.',
    },
    {
      label: 'Property Rules',
      href: `property-rules`,
      subtitle: 'Define what guests should know before booking.',
    },
    {
      label: 'Cancellation policy',
      href: `cancellation-policy`,
      subtitle: 'Set rules and refund percentages for cancellations.',
    },
    {
      label: 'Custom link',
      href: `custom-link`,
      subtitle: 'Create a personalized link to share your place.',
    },
    {
      label: 'Listing status',
      href: 'listing-status',
      subtitle: 'View and manage whether your property is active, paused, or hidden from guests.',
    },
    {
      label: 'Remove listing',
      href: 'remove-listing',
      subtitle: 'Remove your property from ReluxRent and stop receiving new bookings.',
    },
  ];

  const arrivalItems = [
    {
      label: 'Check-in | Checkout',
      href: `check-in-out`,
      subtitle: 'Set check-in and checkout time for guests.',
    },
    {
      label: 'Check-in Instructions',
      href: `checkin-instructions`,
      subtitle: 'Select your preferred check-in method.',
    },
    {
      label: 'Check-out Instructions',
      href: `checkout-instructions`,
      subtitle: 'Guide guests on what to do before they leave.',
    },
    {
      label: 'Directions',
      href: `directions`,
      subtitle: 'Guide guests on how to reach your place.',
    },
    {
      label: 'Wifi details',
      href: 'wifi-details',
      subtitle: 'Share your network name and password.',
    },
    {
      label: 'House manual',
      href: 'house-manual',
      subtitle: 'Provide helpful info about your space.',
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: 65,
          height: '100%',
          width: { xs: '100%', md: '400px' },
          borderRight: '1px solid',
          borderColor: grey[300],
          p: 1.5,
          pb: '190px',
          zIndex: 1060,
        }}
      >
        <TabContext value={value}>
          <Box
            sx={[
              (theme) => ({
                bgcolor: theme.palette.grey[200],
                borderRadius: '999px',
                mt: 2,
              }),
              (theme) =>
                theme.applyStyles('dark', {
                  bgcolor: theme.palette.grey[900],
                }),
            ]}
          >
            <TabList
              onChange={handleChange}
              variant="fullWidth"
              sx={[
                (theme) => ({
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '999px',
                    p: 0,
                    m: 0.5,
                    transition: 'all 0.3s',
                    '&.Mui-selected': {
                      bgcolor: theme.palette.common.white,
                      boxShadow: 1,
                    },
                    '&:not(.Mui-selected)': {
                      color: theme.palette.grey[800],
                    },
                    '&:not(.Mui-selected):hover': {
                      bgcolor: 'rgba(0,0,0,0.04)',
                    },
                  },
                }),
                (theme) =>
                  theme.applyStyles('dark', {
                    '& .MuiTab-root': {
                      '&.Mui-selected': {
                        bgcolor: theme.palette.common.black,
                      },
                      '&:not(.Mui-selected)': {
                        color: theme.palette.grey[400],
                      },
                      '&:not(.Mui-selected):hover': {
                        bgcolor: 'rgba(0,0,0,0.04)',
                      },
                    },
                  }),
              ]}
            >
              <Tab label="Your space" value="space" disableRipple />
              <Tab label="Arrival guide" value="arrival" disableRipple />
            </TabList>
          </Box>

          <TabPanel value="space" sx={{ p: 1, height: '100%', overflowY: 'auto' }}>
            <Stack sx={{ p: 1, height: '100%', overflowY: 'auto' }}>
              {spaceItems.map((item, i) => {
                const isCohost = coHost?.userId === user?.id;
                const permissions = coHost?.permissions || {};
                // Map href to permission key (matching your API keys)
                const permissionMap = {
                  'calender-settings': 'manage_calendar',
                  listing: 'manage_listing',
                  'co-host': 'manage_co_hosts',
                  messages: 'message_guest',
                  'remove-listing': 'remove_listing',
                };
                const requiredPermission = permissionMap[item.href];
                // Hide if a required permission exists but user lacks it
                if (isCohost && requiredPermission && !permissions[requiredPermission]) return null;

                return (
                  <Link
                    key={i}
                    href={{
                      pathname: `/host/property/${id}/edit/${item.href}`,
                      query: { tab: value },
                    }}
                  >
                    <Box
                      sx={[
                        (theme) => ({
                          p: 2,
                          mb: 2,
                          borderRadius: 1,
                          bgcolor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.grey[200] : theme.palette.common.white,
                          border: '1px solid',
                          borderColor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.common.black : theme.palette.grey[100],
                          boxShadow: 4,
                          transition: '0.3s',
                          '&:hover': {
                            bgcolor: theme.palette.grey[100],
                            borderColor: theme.palette.common.black,
                          },
                        }),
                        (theme) =>
                          theme.applyStyles('dark', {
                            bgcolor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.grey[900] : theme.palette.grey[800],
                            borderColor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.common.white : theme.palette.grey[600],
                            '&:hover': {
                              bgcolor: theme.palette.grey[900],
                              borderColor: theme.palette.common.white,
                            },
                          }),
                      ]}
                    >
                      <Typography fontSize={14} fontWeight={500}>
                        {item.label}
                      </Typography>
                      <Typography
                        fontSize={13}
                        sx={[
                          (theme) => ({
                            color: theme.palette.grey[700],
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              color: theme.palette.grey[400],
                            }),
                        ]}
                      >
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Link>
                );
              })}
            </Stack>
          </TabPanel>

          <TabPanel value="arrival" sx={{ p: 1, height: '100%', overflowY: 'auto' }}>
            <Stack sx={{ p: 1, height: '100%', overflowY: 'auto' }}>
              {arrivalItems.map((item, i) => {
                console.log('arrivalItems', item);

                return (
                  <Link
                    key={i}
                    href={{
                      pathname: `/host/property/${id}/edit/${item.href}`,
                      query: { tab: value },
                    }}
                  >
                    <Box
                      sx={[
                        (theme) => ({
                          p: 2,
                          mb: 2,
                          borderRadius: 1,
                          bgcolor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.grey[200] : theme.palette.common.white,
                          border: '1px solid',
                          borderColor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.common.black : theme.palette.grey[100],
                          boxShadow: 4,
                          transition: '0.3s',
                          '&:hover': {
                            bgcolor: theme.palette.grey[100],
                            borderColor: theme.palette.common.black,
                          },
                        }),
                        (theme) =>
                          theme.applyStyles('dark', {
                            bgcolor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.grey[900] : theme.palette.grey[800],
                            borderColor: router.pathname == `/host/property/[id]/edit/${item.href}` ? theme.palette.common.white : theme.palette.grey[600],
                            '&:hover': {
                              bgcolor: theme.palette.grey[900],
                              borderColor: theme.palette.common.white,
                            },
                          }),
                      ]}
                    >
                      <Typography fontSize={14} fontWeight={500}>
                        {item.label}
                      </Typography>
                      <Typography
                        fontSize={13}
                        sx={[
                          (theme) => ({
                            color: theme.palette.grey[700],
                          }),
                          (theme) =>
                            theme.applyStyles('dark', {
                              color: theme.palette.grey[400],
                            }),
                        ]}
                      >
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Link>
                );
              })}
            </Stack>
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};

export default Sidebar;
