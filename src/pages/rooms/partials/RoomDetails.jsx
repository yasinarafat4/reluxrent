import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { convertAndFormatToActiveCurrency } from '@/utils/convertAndFormatPrice';
import { Avatar, Box, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Reservation from './Reservation';

const RoomDetails = ({ propertyData }) => {
  console.log('RoomDetails', propertyData);
  const { trans } = useTranslation();
  const { actions } = usePopups();
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const defaultClassNames = getDefaultClassNames();
  const isXs = useMediaQuery((theme) => theme.breakpoints.only('xs'));

  const hasAnyDescription = [
    propertyData?.propertyDescription?.aboutPlace,
    propertyData?.propertyDescription?.placeIsGreatFor,
    propertyData?.propertyDescription?.guestCanAccess,
    propertyData?.propertyDescription?.interactionGuests,
    propertyData?.propertyDescription?.aboutNeighborhood,
    propertyData?.propertyDescription?.getAround,
  ].some((html) => html && html.replace(/<[^>]+>/g, '').trim() !== '');

  const { description, aboutPlace, placeIsGreatFor, guestCanAccess, interactionGuests } = propertyData?.propertyDescription || {};
  const content = description?.trim() || aboutPlace?.trim() || placeIsGreatFor?.trim() || guestCanAccess?.trim() || interactionGuests?.trim() || null;

  const MyCustomDayButton = ({ day, selected, propertyData, range, min, className, modifiers, ...props }) => {
    const date = new Date(day.date);
    const from = range?.from ? new Date(range.from) : null;
    if (from) from.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = from ? Math.round((date - from) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const showTooltip = range?.from && !range?.to && !modifiers?.disabled && diffDays > 0 && diffDays < min;

    return (
      <>
        <Tooltip open={showTooltip} placement="top" title={`${propertyData?.minimumStay} nights minimum`}>
          <button className={`${className}`} {...props}>
            <span className={modifiers?.disabled ? 'line-through text-red-400' : ''}>{day.date.getDate()}</span>
          </button>
        </Tooltip>
      </>
    );
  };

  const bookedDates = new Set(propertyData?.bookings?.flatMap((booking) => booking.bookingDates.map((d) => format(new Date(d.date), 'yyyy-MM-dd'))));

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (propertyData?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    if (bookedDates.has(formattedDate)) {
      return true;
    }
    return false;
  };

  return (
    <Box paddingTop={3}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} alignItems="flex-start">
        {/* Left Content */}
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold">
            {propertyData?.spaceType?.name} in {propertyData?.propertyType?.name} in {propertyData?.propertyAddress?.city?.name}, {propertyData?.propertyAddress?.country?.name}
          </Typography>
          <Typography color="text.primary" variant="body2">
            {propertyData?.accommodates || 0} {propertyData?.accommodates > 1 ? 'guests' : 'guest'} • {propertyData?.bedrooms || 0} {propertyData?.bedrooms > 1 ? 'bedrooms' : 'bedroom'} •{' '}
            {propertyData?.beds || 0} {propertyData?.beds > 1 ? 'beds' : 'bed'} • {propertyData?.bathrooms || 0} {propertyData?.bathrooms > 1 ? 'bathrooms' : 'bathroom'}
          </Typography>

          {/* Badge & Rating */}
          {/* <Box mt={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Paper
              variant="outlined"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Typography fontWeight="bold">🌟 Guest favorite</Typography>
              <Typography ml={1}>· One of the most loved homes on ReluxRent</Typography>
            </Paper>
            <Box display="flex" alignItems="center" ml={{ xs: 0, md: 2 }}>
              <Stack direction={'row'} alignItems="center" justifyContent="center">
                // Left laurel
                <Box
                  sx={(theme) => ({
                    position: 'relative',
                    height: 30,
                    width: 15,
                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
                  })}
                >
                  <Image src="/images/left-laurel.png" alt="Left laurel" fill />
                </Box>
                // Rating number 
                <Typography fontWeight="bold">{propertyData.overallRating || 0}</Typography>
             // Right laurel 
                <Box
                  sx={(theme) => ({
                    position: 'relative',
                    height: 30,
                    width: 15,
                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'invert(0)',
                  })}
                >
                  <Image src="/images/right-laurel.png" alt="Right laurel" fill />
                </Box>
              </Stack>
              <StarIcon sx={{ color: '#fbbf24', ml: 0.5 }} />
              <Typography ml={1} color="text.primary">
                {propertyData.reviewCount} Reviews
              </Typography>
            </Box>
          </Box> */}
         

          <Divider sx={{ my: 3 }} />

          {/* Property Description */}
          <Stack my={2} spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              {trans('About this place')}
            </Typography>
            {content ? (
              <Stack gap={2}>
                {/* Description */}
                <Typography component="div" dangerouslySetInnerHTML={{ __html: content }} className="editor-content" />
              </Stack>
            ) : (
              <Typography variant="subtitle1" fontWeight={500} color="warning">
                {trans('No description found!')}
              </Typography>
            )}
            {hasAnyDescription && (
              <Button
                onClick={() => actions.openPopup('propertyDescription', propertyData?.propertyDescription)}
                variant="outlined"
                size="small"
                sx={{ mt: 2, width: { xs: '130px' }, textTransform: 'none' }}
              >
                {trans('Show more')}
              </Button>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Sleeping arrangements */}
          <Stack my={2} spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              {trans('Sleeping arrangements')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(4, 1fr)',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 2,
              }}
            >
              {propertyData?.bedrooms_data?.map((bedroom, i) => (
                <Paper
                  key={i}
                  sx={[
                    (theme) => ({
                      p: 2,
                      boxShadow: theme.shadows[0],
                      border: '1px solid',
                      borderColor: 'divider',
                    }),
                  ]}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {trans('Bedroom No')}: {i + 1}
                  </Typography>
                  {bedroom?.beds?.map((bed, i) => (
                    <Typography key={i} variant="body2">
                      {bed.quantity} {bed.bed_type}
                    </Typography>
                  ))}
                </Paper>
              ))}
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Amenities */}
          <Stack my={2} spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              {trans('Amenities')}
            </Typography>
            {propertyData?.amenities?.length > 0 ? (
              <Stack>
                <List
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                    },
                    gap: 1,
                    width: '100%',
                    p: 0,
                    // bgcolor: 'background.paper',
                  }}
                >
                  {propertyData?.amenities?.slice(0, 8).map((amenity, i) => (
                    <ListItem key={i} alignItems="center" sx={{ p: 0 }}>
                      <ListItemAvatar>
                        <Avatar alt="Remy Sharp" src={amenity?.icon} />
                      </ListItemAvatar>
                      <ListItemText
                        sx={{
                          '& .MuiTypography-root': {
                            fontSize: { xs: 12, sm: 13 },
                          },
                        }}
                        primary={amenity?.name}
                      />
                    </ListItem>
                  ))}
                </List>
                {propertyData?.amenities?.length > 8 && (
                  <Button onClick={() => actions.openPopup('propertyAmenities', propertyData)} variant="outlined" size="small" sx={{ mt: 2, textTransform: 'none', width: '150px' }}>
                    {trans('Show more')}
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography variant="subtitle1" my={1} fontWeight={500} color="warning">
                {trans('No amenities found!')}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Prices */}
          <Stack my={2} spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              {trans('Prices')}
            </Typography>

            <List
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                },
                gap: 0.5,
                width: '100%',
                p: 0,
                // bgcolor: 'background.paper',
              }}
            >
              <ListItem sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start', p: 0 }}>
                <ListItemText
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: { xs: 12, sm: 13 },
                    },
                  }}
                  primary={
                    <Stack direction={'row'} gap={1}>
                      <Typography fontWeight={600}>{trans('Extra charge')} (%) :</Typography>{' '}
                      <Typography>{convertAndFormatToActiveCurrency(propertyData, propertyData?.propertyPrice?.guestAfterFee) || 'No Charge'}</Typography>
                    </Stack>
                  }
                />

                <ListItemText
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: { xs: 12, sm: 13 },
                    },
                  }}
                  primary={
                    <Stack direction={'row'} gap={1}>
                      <Typography fontWeight={600}>{trans('Weekly discount')} (%) :</Typography> <Typography>{propertyData?.propertyPrice?.weeklyDiscount} /week</Typography>
                    </Stack>
                  }
                />
              </ListItem>

              <ListItem sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start', p: 0 }}>
                <ListItemText
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: { xs: 12, sm: 13 },
                    },
                  }}
                  primary={
                    <Stack direction={'row'} gap={1}>
                      <Typography fontWeight={600}>{trans('Monthly discount')} (%) :</Typography> <Typography>{propertyData?.propertyPrice?.monthlyDiscount} /month</Typography>
                    </Stack>
                  }
                />

                <ListItemText
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: { xs: 12, sm: 13 },
                    },
                  }}
                  primary={
                    <Stack direction={'row'} gap={1}>
                      <Typography fontWeight={600}>{trans('Cancellation Policy')} :</Typography>{' '}
                      <Typography
                        component={Link}
                        href="/help/cancellation-policy"
                        sx={{
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {propertyData?.cancellationPolicy?.name ? propertyData?.cancellationPolicy?.name : 'No data found!'}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Calendar */}
            <Box className="calendar-container" sx={{ mt: 2, width: '100%', mx: 'auto' }}>
              <DayPicker
                classNames={{ root: `${defaultClassNames.root} room-details-calender` }}
                mode="range"
                numberOfMonths={isXs ? 1 : 2}
                navLayout="around"
                selected={range}
                onSelect={setRange}
                disabled={disableDate}
                excludeDisabled
                min={propertyData?.minimumStay}
                components={{
                  DayButton: (props) => <MyCustomDayButton {...props} propertyData={propertyData} range={range} min={propertyData?.minimumStay} />,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', justifyItems: 'end' }}>
              <Button
                size="small"
                variant="text"
                sx={{
                  fontSize: 14,
                  textTransform: 'none',
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                  },
                }}
                onClick={() => setRange({ from: undefined, to: undefined })}
              >
                {trans('Clear Dates')}
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* Large Device Right Sidebar */}
        <Box width={{ xs: '100%', md: 350, lg: 400 }} position={{ md: 'sticky' }} top={90} alignSelf="flex-start">
          {/* Rare Find Tag */}
          {/* <Paper
            sx={[
              (theme) => ({
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.1)',
                mb: 2,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: theme.palette.common.white,
              }),
              (theme) =>
                theme.applyStyles('dark', {
                  bgcolor: theme.palette.common.black,
                  color: theme.palette.common.white,
                }),
            ]}
          >
            <DiamondIcon sx={{ color: '#e91e63' }} />
            <Typography fontWeight="bold" fontSize={14}>
              Rare find! This place is usually booked
            </Typography>
          </Paper> */}

          {/* Reservation Box */}
          <Reservation propertyData={propertyData} range={range} setRange={setRange} />
        </Box>
      </Box>
      <Divider sx={{ my: 3 }} />
    </Box>
  );
};

export default RoomDetails;
