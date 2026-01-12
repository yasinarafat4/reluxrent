import PropertyCard from '@/components/cards/PropertyCard';
import Layout from '@/components/layout/front/Layout';
import NoDataFound from '@/components/NoDataFound';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box, Button, Divider, Pagination, Stack, Typography, useMediaQuery } from '@mui/material';
import { Funnel } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useSWR from 'swr';
const MapWithMarker = dynamic(() => import('@/components/MapWithMarker'), { ssr: false });

const HomeSearchResults = () => {
  const { trans, lang, setLang } = useTranslation();
  const router = useRouter();
  const { property_type } = router.query;
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const { actions } = usePopups();
  const queryString = new URLSearchParams({
    ...router.query,
    lang: lang.code,
  }).toString();

  console.log('queryString', queryString);

  const { data: propertiesData = [], isLoading: propertiesLoading } = useSWR(`/api/front/filtered-properties?${queryString}`, fetcher);
  const { data: propertyTypes = [], isLoading: propertyTypesLoading } = useSWR(`/api/front/property-types?lang=${lang.code}`, fetcher);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChange = (event) => {
    setRowsPerPage(event.target.value);
  };

  const addParam = (key, value) => {
    const newQuery = {
      ...router.query,
      [key]: value,
    };

    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true }, // <-- important to avoid full reload
    );
  };

  if (propertiesLoading || propertyTypesLoading) {
    return (
      <Box p={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Layout>
      <Box
        flex={1}
        position={'relative'}
        display="flex"
        flexDirection={{ xs: 'column-reverse', md: 'row' }}
        maxWidth="xl"
        mx="auto"
        height={'100%'}
        width={'100%'}
        gap={{ xs: 2, lg: 5 }}
        px={{ sm: 2 }}
      >
        {/* Left side - listings */}
        <Box width={{ md: '55%', lg: '60%' }}>
          <Stack direction={{ xs: 'row' }} justifyContent={'space-between'} alignItems={'center'} gap={2}>
            <Stack direction={'row'} gap={2} sx={{ width: { xs: '100%', md: 'auto' }, overflowX: 'auto' }}>
              {/* Property Type filter */}
              {propertyTypes &&
                propertyTypes?.map((type, i) => (
                  <Stack
                    onClick={() => addParam('property_type', type.id)}
                    key={i}
                    direction={'row'}
                    border={'1px solid'}
                    borderColor={property_type == type.id ? 'primary.main' : 'divider'}
                    borderRadius={2}
                    py={0.6}
                    px={2}
                    gap={0.5}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                      flexShrink: 0,
                      cursor: 'pointer',
                      transition: 'border-color 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Image src={type?.icon} height={30} width={30} alt={type?.name} />
                    <Typography fontSize={{ xs: 11, sm: 13 }}>{type?.name}</Typography>
                  </Stack>
                ))}
            </Stack>

            <Stack>
              {/* Filter */}
              <Button onClick={() => actions.openPopup('filterProperty', {})} variant="outlined" size="small" sx={{ textTransform: 'none' }} startIcon={<Funnel size={15} />}>
                {trans('Filter')}
              </Button>
            </Stack>
          </Stack>
          <Divider sx={{ my: 2 }} />
          {propertiesData.length > 0 ? (
            <>
              {' '}
              <Box
                width={'100%'}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(2, minmax(0, 1fr))',
                  sm: 'repeat(3, minmax(0, 1fr))',
                  md: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                }}
                gap={2}
              >
                {propertiesData.map((property, i) => (
                  <PropertyCard key={i} property={property} />
                ))}
              </Box>
              {/* Pagination */}
              <Box display="flex" justifyContent="end" alignItems={'center'} p={2}>
                <Pagination count={isXs ? 5 : 10} variant="outlined" color="primary" />
              </Box>
            </>
          ) : (
            <NoDataFound title={'No property found!'} />
          )}
        </Box>

        {/* Right side - map */}
        <Box width={{ md: '45%', lg: '40%' }} position={{ md: 'sticky' }} top={100} right={0} height={{ xs: '350px', sm: '500px', md: '600px', xl: '770px' }}>
          <MapWithMarker propertiesData={propertiesData} />
        </Box>
      </Box>
    </Layout>
  );
};

export default HomeSearchResults;
