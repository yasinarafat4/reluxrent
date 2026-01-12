import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Button, capitalize, Divider, IconButton, List, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function FilterPopup({ closeModal, showModal }) {
  const router = useRouter();
  // const { bathrooms,bedrooms,beds, amenities } = router.query;
  const { trans, lang } = useTranslation();
  const min = 300;
  const max = 600;

  const [groupedAmenities, setGroupedAmenities] = useState([]);

  const [filters, setFilters] = useState({
    space_type: router.query.space_type || '',
    minPrice: router.query.minPrice || min,
    maxPrice: router.query.maxPrice || max,
    bedrooms: router.query.bedrooms || 0,
    beds: router.query.beds || 0,
    bathrooms: router.query.bathrooms || 0,
    amenities: router.query.amenities ? (Array.isArray(router.query.amenities) ? router.query.amenities.map(Number) : [Number(router.query.amenities)]) : [],
  });

  console.log('filters', filters);

  const { data: amenitiesData = [], isLoading: amenitiesLoading } = useSWR(`/api/front/amenities`, fetcher);

  const { data: spaceTypesData = [], isLoading: spaceTypesLoading } = useSWR(`/api/front/space-types?lang=${lang.code}`, fetcher);

  // Amenities Grouping by type
  useEffect(() => {
    const groupedAmenities = amenitiesData.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
    setGroupedAmenities(groupedAmenities);
  }, [amenitiesData]);

  // Type handler
  const handleChange = (spaceTypeId) => {
    setFilters((prev) => ({
      ...prev,
      space_type: prev.space_type === spaceTypeId ? '' : spaceTypeId,
    }));
  };

  // Range handler
  const handlePriceRangeChange = (_, newValue) => {
    setFilters((prev) => ({ ...prev, minPrice: newValue[0], maxPrice: newValue[1] }));
  };

  // Rooms and beds handler
  const handleIncrease = (value, key) => {
    const numaricValue = Number(value);
    const newValue = numaricValue === null ? 1 : numaricValue + 1;
    setFilters((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleDecrease = (value, key) => {
    const numaricValue = Number(value);
    if (numaricValue > 0) {
      const newValue = numaricValue - 1;
      setFilters((prev) => ({ ...prev, [key]: newValue === 0 ? null : newValue }));
    }
  };

  const toggleAmenity = (id) => {
    setFilters((prev) => {
      const exists = prev?.amenities?.includes(id);
      return {
        ...prev,
        amenities: exists ? prev?.amenities.filter((a) => a !== id) : [...prev?.amenities, id],
      };
    });
  };

  const renderValue = (value) => {
    if (value === null) return 'Any';
    if (value === 1) return '1+';
    return `${value}+`;
  };

  const applyFilters = () => {
    const newQuery = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === 'any' || (Array.isArray(value) && value.length === 0)) return;

      newQuery[key] = value;
    });

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, ...newQuery },
      },
      undefined,
      { shallow: true }, // important: avoid full reload
    );

    closeModal();
  };

  // const applyFilters = () => {
  //   const url = new URL(window.location.origin + router.pathname);
  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value === null || value === 'any' || (Array.isArray(value) && value.length === 0)) return;

  //     if (Array.isArray(value)) {
  //       value.forEach((v) => url.searchParams.append(key, v));
  //     } else {
  //       url.searchParams.set(key, value);
  //     }
  //   });

  //   router.push(url.pathname + '?' + url.searchParams.toString());
  //   closeModal();
  // };

  const clearFilters = () => {
    const keysToRemove = ['space_type', 'minPrice', 'maxPrice', 'bedrooms', 'beds', 'bathrooms', 'amenities'];
    const url = new URL(window.location.href);
    keysToRemove.forEach((k) => url.searchParams.delete(k));

    const search = url.searchParams.toString();
    const newPath = url.pathname + (search ? `?${search}` : '') + url.hash;

    setFilters((prev) => ({
      ...prev,
      space_type: '',
      minPrice: min,
      maxPrice: max,
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      amenities: [],
    }));

    router.push(newPath);

    closeModal();
  };

  if (amenitiesLoading || spaceTypesLoading) {
    return (
      <Box p={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      aria-labelledby="responsive-dialog-title"
    >
      {/* Header */}
      <Box position={'relative'} p={2}>
        <Stack direction={'row'} justifyContent="center" alignItems="center">
          <Typography variant="h6" textAlign={'center'} fontWeight={600}>
            {trans('Filter')}
          </Typography>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
            position: 'absolute',
            top: 16,
            right: 16,
            p: 0,
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>
      <Divider />
      <DialogContent sx={{ p: 2 }}>
        {/* Space type filter */}
        <Box>
          <Typography variant="h6" fontWeight={500} mb={1}>
            {trans('Type of place')}
          </Typography>

          <Box>
            <List
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                },
                gap: 1,
              }}
            >
              {spaceTypesData.map((spaceType, i) => {
                return (
                  <Stack
                    onClick={() => handleChange(spaceType.id)}
                    key={i}
                    border={'1px solid'}
                    borderColor={filters?.space_type == spaceType.id ? 'primary.main' : 'divider'}
                    borderRadius={1}
                    py={1}
                    px={0}
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
                    <Typography fontSize={{ xs: 11, sm: 13 }}>{spaceType?.name}</Typography>
                  </Stack>
                );
              })}
            </List>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        {/* Range filter */}
        <Box>
          <Stack mb={1}>
            <Typography variant="h6" fontWeight={500}>
              {trans('Price range')}
            </Typography>
            <Typography variant="body2">{trans('Trip price, includes all fees')}</Typography>
          </Stack>
          <Box width={'95%'} mx={'auto'} px={1}>
            <Slider
              step={1}
              min={min}
              max={max}
              value={[filters.minPrice, filters.maxPrice]}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `$${v}`}
              onChange={handlePriceRangeChange}
              sx={{ p: 0 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Stack justifyContent={'center'}>
                <Typography fontSize={13}>{trans('Minimum')}</Typography>
                <Box py={1} px={2} border={'1px solid'} borderRadius={1} fontSize={14} color={'text.primary'} textAlign={'center'} borderColor={'divider'}>
                  ${filters.minPrice ?? min}
                </Box>
              </Stack>
              <Stack justifyContent={'center'}>
                <Typography fontSize={13}>{trans('Maximum')}</Typography>
                <Box py={1} px={2} border={'1px solid'} borderRadius={1} fontSize={14} color={'text.primary'} textAlign={'center'} borderColor={'divider'}>
                  ${filters.maxPrice ?? max}
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        {/* Rooms and beds filter */}
        <Box>
          <Typography variant="h6" mb={1}>
            {trans('Rooms and beds')}
          </Typography>

          {/* Bedrooms */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>{trans('Bedrooms')}</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton
                disabled={filters.bedrooms === null}
                sx={{
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                size="small"
                onClick={() => handleDecrease(filters.bedrooms, 'bedrooms')}
              >
                <Minus size={16} />
              </IconButton>
              <Typography fontSize={15}>{renderValue(filters.bedrooms)}</Typography>
              <IconButton
                sx={{
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                size="small"
                onClick={() => handleIncrease(filters.bedrooms, 'bedrooms')}
              >
                <Plus size={16} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Beds */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" py={2}>
            <Typography>{trans('Beds')}</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton
                disabled={filters.beds === null}
                sx={{
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                size="small"
                onClick={() => handleDecrease(filters.beds, 'beds')}
              >
                <Minus size={16} />
              </IconButton>
              <Typography fontSize={15}>{renderValue(filters.beds)}</Typography>
              <IconButton
                sx={{
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                size="small"
                onClick={() => handleIncrease(filters.beds, 'beds')}
              >
                <Plus size={16} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Bathrooms */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>{trans('Bathrooms')}</Typography>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton
                disabled={filters.bathrooms === null}
                sx={{
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                size="small"
                onClick={() => handleDecrease(filters.bathrooms, 'bathrooms')}
              >
                <Minus size={16} />
              </IconButton>
              <Typography fontSize={15}>{renderValue(filters.bathrooms)}</Typography>
              <IconButton
                sx={{
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'text.primary',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    cursor: 'not-allowed',
                  },
                }}
                size="small"
                onClick={() => handleIncrease(filters.bathrooms, 'bathrooms')}
              >
                <Plus size={16} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />
        {/* Amenities filter */}
        <Box>
          <Typography variant="h6" fontWeight={500} mb={1}>
            {trans('Amenities')}
          </Typography>
          <Stack gap={2}>
            {Object.entries(groupedAmenities).map(([resource, perms]) => (
              <Box key={resource}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  {capitalize(resource)}
                </Typography>
                <Box>
                  <List
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                      },
                      gap: 1,
                    }}
                  >
                    {perms.map((item, i) => {
                      return (
                        <Stack
                          onClick={() => toggleAmenity(item.id)}
                          key={i}
                          direction="row"
                          border={'1px solid'}
                          borderColor={filters?.amenities?.map(Number).includes(item.id) ? 'primary.main' : 'divider'}
                          borderRadius={2}
                          py={1}
                          px={0}
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
                          <Image src={item?.icon} height={25} width={25} alt={item?.name} />
                          <Typography fontSize={{ xs: 11, sm: 13 }}>{item?.name}</Typography>
                        </Stack>
                      );
                    })}
                  </List>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <Divider />
      {/* Footer Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} p={2}>
        <Button
          onClick={() => clearFilters()}
          variant="text"
          sx={{
            color: 'text.primary',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 0,
          }}
        >
          {trans('Clear all')}
        </Button>
        <Button
          onClick={() => applyFilters()}
          type="button"
          variant="contained"
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          {trans('Filter')}
        </Button>
      </Box>
    </Dialog>
  );
}
