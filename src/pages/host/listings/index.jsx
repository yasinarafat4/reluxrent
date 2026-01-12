import ListingCard from '@/components/cards/ListingCard';
import HostingLayout from '@/components/layout/host/HostingLayout';
import NoDataFound from '@/components/NoDataFound';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import AddIcon from '@mui/icons-material/Add';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Container, Divider, Pagination, Stack, Tab } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const Listings = () => {
  const { trans, lang } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { type, status } = router.query;
  const page = Number(router.query.page) || 1;
  const { data: listingPropertiesData = [], isLoading, mutate } = useSWR(`/api/host/listing-properties?lang=${lang.code}&type=${type}&status=${status}&page=${page}`, fetcher);
  console.log('listingPropertiesData', listingPropertiesData);
  const onDataChange = (e, value) => {
    const url = new URL(window.location.origin + router.asPath);
    url.searchParams.set('page', value);
    router.push(url.pathname + '?' + url.searchParams.toString(), undefined, { shallow: true });
  };

  if (isLoading || !user) {
    return null;
  }
  return (
    <HostingLayout>
      <Container maxWidth={'xl'}>
        <Box sx={{ width: '100%' }} pb={{ xs: 10, md: 2 }}>
          <TabContext value={type}>
            {/* Tabs */}
            <Box width={'100%'} display={'flex'} justifyContent={'center'} py={2}>
              <TabList
                sx={{
                  display: 'flex',
                  gap: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '999px',
                    minHeight: '32px',
                    minWidth: 'auto',
                    mr: 2,
                    px: 3,
                    py: 1.7,
                    fontSize: 14,
                    transition: 'all 0.3s ease',
                  },
                  '& .Mui-selected': {
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  },
                  '& .MuiTab-root:not(.Mui-selected)': {
                    bgcolor: 'grey.200',
                    color: 'grey.800',
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                <Tab
                  label="Homes"
                  value="home"
                  component={Link}
                  href={`/host/listings?type=${'home'}&status=${status}`}
                  sx={{
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: 'grey.100',
                    },
                  }}
                />
                <Tab
                  label="Experiences"
                  value="experience"
                  component={Link}
                  href={`/host/listings?type=${'experience'}&status=${status}`}
                  sx={{
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: 'grey.100',
                    },
                  }}
                />
              </TabList>
            </Box>

            {/* Sort by Listed/Unlisted */}
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} gap={{ xs: 0.5, sm: 1 }} padding={1}>
              <MenuList
                dense
                disablePadding
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0.5,
                  overflowX: 'auto',
                }}
              >
                {['All', 'Listed', 'Unlisted'].map((s) => {
                  const isActive = status === s;

                  return (
                    <MenuItem
                      key={s}
                      component={Link}
                      href={`/host/listings?type=${type}&status=${s}`}
                      selected={isActive}
                      sx={{
                        py: 1,
                        px: 2,
                        borderBottom: isActive ? '3px solid' : '3px solid transparent',
                        borderColor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.main' : 'text.secondary',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: 0,
                        transition: 'all 0.2s ease',
                        '& .MuiTypography-root': {
                          fontSize: { xs: 12, sm: 13 },
                        },
                        '&:hover': {
                          borderColor: isActive ? 'primary.main' : 'grey.400',
                          backgroundColor: 'transparent',
                          color: 'primary.main',
                        },
                      }}
                    >
                      <ListItemText primary={trans(s)} />
                    </MenuItem>
                  );
                })}
              </MenuList>
              <Button
                size="small"
                sx={{
                  textTransform: 'none',
                  px: { xs: 1, sm: 2 },
                  py: 1,
                  fontSize: { xs: 10, sm: 12 },
                }}
                component={Link}
                href="/host/property/create"
                variant="contained"
                color="primary"
                endIcon={<AddIcon />}
              >
                {trans('Add New Listing')}
              </Button>
            </Stack>

            <TabPanel value="home" sx={{ p: '1px' }}>
              {listingPropertiesData.data.length > 0 ? (
                <Box display={'grid'} gridTemplateColumns={{ xs: 'repeat(1, 1fr)', xl: 'repeat(2, 1fr)' }} gap={2}>
                  {listingPropertiesData.data.map((property, i) => (
                    <Box key={i}>
                      <ListingCard property={property} mutate={mutate} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <NoDataFound title={'No data available!'} subtitle={'Data will appear here once available.'} />
              )}
              {/* Pagination */}
              {listingPropertiesData?.data?.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="end">
                    <Pagination onChange={onDataChange} page={page} count={listingPropertiesData?.pagination?.totalPages} variant="outlined" shape="rounded" />
                  </Box>
                </>
              )}
            </TabPanel>

            <TabPanel value="experience" sx={{ p: '1px' }}>
              <Stack gap={2}>
                <NoDataFound title={'No data available!'} subtitle={'Data will appear here once available.'} />
              </Stack>
            </TabPanel>
          </TabContext>
        </Box>
      </Container>
    </HostingLayout>
  );
};

export default Listings;
