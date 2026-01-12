import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { formatPrice } from '@/utils/convertAndFormatPrice';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ShowerIcon from '@mui/icons-material/Shower';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, Chip, FormControlLabel, Stack, Switch, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { green, red } from '@mui/material/colors';
import { CalendarCheck, Eye, MapPin, SquarePen } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

const ListingCard = ({ property, mutate }) => {
  console.log('ListingCardProperty', property);
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { trans } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const onListingChange = async (event) => {
    const checked = event.target.checked;
    const selectedStatus = checked ? 'Listed' : 'Unlisted';
    setLoading(true);
    if (selectedStatus == property?.status) {
      return;
    }
    try {
      const { data } = await api.put(`/api/host/property/${property?.id}/update/status`, { status: selectedStatus });
      enqueueSnackbar(data.message, { variant: 'success' });
      mutate();
    } catch (err) {
      console.error('Error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        p: 1,
        position: 'relative',
      }}
    >
      {/* Image */}
      <CardMedia
        component="img"
        sx={{ width: { sm: '250px', lg: '300px', xl: '280px' }, height: { sm: '205px', lg: '200px' }, borderRadius: '6px', objectFit: 'cover' }}
        image={property?.propertyImages[0]?.image || '/images/placeholders/property_placeholder.jpg'}
        alt={property?.propertyDescription?.name}
      />
      <Stack
        direction={'row'}
        gap={1}
        sx={{
          position: 'absolute',
          top: 15,
          left: 15,
        }}
      >
        <Chip
          sx={{
            height: 22,
            fontWeight: 500,
            pointerEvents: 'none',
            '& .MuiChip-label': {
              fontSize: '11px',
              px: '10px',
              py: '0px',
              lineHeight: 1.2,
            },
          }}
          label={property?.isApproved ? 'Approved' : 'Pending'}
          color={property?.isApproved ? 'success' : 'warning'}
        />
        <Chip
          label={property.host.id == user.id ? 'Host' : 'Co-host'}
          color={property.host.id == user.id ? 'info' : 'primary'}
          sx={{
            height: 22,
            fontWeight: 500,
            pointerEvents: 'none',
            '& .MuiChip-label': {
              fontSize: '11px',
              px: '10px',
              py: '0px',
              lineHeight: 1.2,
            },
          }}
        />
      </Stack>
      {/* Contents */}
      <Box flex={1} display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} width={'100%'} gap={2}>
        <Stack flex={1} direction={'column'} width={'100%'}>
          <Box>
            {/* Title & Status */}
            <Typography
              variant="h5"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2, // max 2 lines
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {property?.propertyDescription?.name ? property?.propertyDescription?.name : <Typography variant="h5">Your listing started {moment(property?.createdAt).format('ll')}</Typography>}
            </Typography>

            {/* Location */}
            <Stack direction="row" alignItems="center" spacing={1} mt={1}>
              <MapPin size={16} />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  color: 'text.primary',
                  maxWidth: '250px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {property?.propertyAddress?.addressLine1 || 'Location not found!'}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" gap={2} mt={1}>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <PeopleAltIcon sx={{ color: 'text.secondary', fontSize: '17px' }} />
                <Typography variant="body2" color="text.secondary">
                  {property?.accommodates || 0}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={0.5}>
                <HotelIcon sx={{ color: 'text.secondary', fontSize: '17px' }} />
                <Typography variant="body2" color="text.secondary">
                  {property?.bedrooms || 0}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={0.5}>
                <ShowerIcon sx={{ color: 'text.secondary', fontSize: '18px' }} />
                <Typography variant="body2" color="text.secondary">
                  {property?.bathrooms || 0}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              mt: 'auto',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'),
              borderRadius: 12,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <StarIcon sx={{ color: '#fbbf24' }} />
              <Typography variant="body2">
                {property?.overallRating || 0} ({property?.reviewCount || 0})
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography fontWeight="bold" variant="body2">
                {formatPrice(property?.propertyPrice.currency, property?.propertyPrice.price)}
              </Typography>
              <Typography variant="body2">/ {trans('Night')}</Typography>
            </Box>
          </Box>
        </Stack>

        {/* Actions */}
        <Box height={'auto'}>
          <Stack direction="column" justifyContent={'space-between'} gap={1} height={'100%'}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: '3px 10px',
                bgcolor: property?.status == 'Listed' ? green[500] : red[500],
                color: 'white',
                borderRadius: 12,
              }}
            >
              <FormControlLabel
                control={<Switch size="small" checked={property?.status == 'Listed'} color="default" onChange={onListingChange} aria-label="switch" />}
                label={
                  <Typography variant="body2" fontSize={13} sx={{ color: 'white' }}>
                    {property?.status == 'Listed' ? 'Listed' : 'Unlisted'}
                  </Typography>
                }
              />
            </Box>
            <Stack gap={0.7}>
              <Button
                sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '8px !important' }}
                component={Link}
                href={isXs ? `/host/property/${property?.id}` : `/host/property/${property?.id}/edit/${property?.nextStep}`}
                size="small"
                variant="outlined"
                startIcon={<SquarePen size={15} />}
              >
                {trans('Edit Listing')}
              </Button>
              <Button
                sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '8px !important' }}
                component={Link}
                href={`/rooms/${property?.id}`}
                target="_blank"
                size="small"
                variant="outlined"
                startIcon={<Eye size={15} />}
              >
                {trans('Preview')}
              </Button>
              <Button
                sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '8px !important' }}
                component={Link}
                href={`#`}
                size="small"
                variant="outlined"
                startIcon={<CalendarCheck size={15} />}
              >
                {trans('View Booking')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};

export default ListingCard;
