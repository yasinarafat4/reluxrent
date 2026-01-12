import { usePopups } from '@/contexts/PopupContext';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { AdminConvertAndFormatToDefaultCurrency, convertAndFormatBookedCurrency } from '@/utils/convertAndFormatPrice';
import { CountdownTimer } from '@/utils/CountdownTimer';
import { formatGuestSummary } from '@/utils/formatGuestSummary';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { differenceInDays, format, formatDistanceToNow, parseISO } from 'date-fns';
import { Banknote, ChevronRight, Globe, Headset, Home, HousePlus, PersonStanding, Phone, Radius, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Avatar from 'react-avatar';

const DetailsSidebar = ({ bookingDetails }) => {
  const { actions } = usePopups();
  const { guestFee, hostFee } = useReluxRentAppContext();
  const lastBooking = bookingDetails?.lastBooking;
  console.log('adminLastBooking', lastBooking);
  const hostName = lastBooking?.host?.name || 'Host';
  const guestName = lastBooking?.guest?.name || 'Guest';
  const isAvailable = lastBooking?.property?.isAvailable;

  // Exact hosting date
  const hostCreatedAt = parseISO(lastBooking?.host?.hostAt);
  const daysHosting = differenceInDays(new Date(), hostCreatedAt) || 1;

  return (
    <Box py={1}>
      {/* Property Details */}
      <Box>
        <Box sx={{ width: '100%', height: { xs: '200px', sm: '400px', md: '200px', xl: '250px' }, position: 'relative' }}>
          <Image src={lastBooking?.property?.propertyImages[0]?.image} priority alt={''} fill style={{ objectFit: 'cover', borderRadius: '16px' }} />

          <Box position={'absolute'} left={10} top={10} px={1.5} py={'3px'} borderRadius={2} fontSize={10} bgcolor={'primary.main'} color={'text.primary'}>
            <Typography variant="subtitle2" color="common.white" fontSize={12}>
              {bookingDetails?.guestStatus}
            </Typography>
          </Box>
        </Box>
        <Stack gap={2} my={1}>
          {lastBooking?.bookingStatus !== 'CONFIRMED' && !isAvailable ? (
            // ❌ Dates no longer available (highest priority if not confirmed)
            <>
              <Stack gap={2} mb={1}>
                <Typography variant="body1" fontWeight={500}>
                  {guestName}'s' dates are no longer available.
                </Typography>
              </Stack>
            </>
          ) : lastBooking?.bookingStatus === 'CONFIRMED' ? (
            // ✅ Booking confirmed
            <>
              {bookingDetails?.guestStatus == 'Upcoming Stay' ? (
                <Box mb={1}>
                  <Typography variant="body1" fontWeight={500}>
                    {guestName}'s' booking is confirmed.
                  </Typography>
                </Box>
              ) : bookingDetails?.guestStatus == 'Currently Staying' ? (
                <>
                  <Stack gap={2} mb={1}>
                    <Typography variant="body2">
                      {guestName} currently checked in at {hostName}'s place.
                    </Typography>
                  </Stack>
                </>
              ) : bookingDetails?.guestStatus == 'Past Guest' ? (
                <>
                  <Stack gap={2} mb={1}>
                    <Typography variant="body2">{guestName}'s trip has ended.</Typography>
                  </Stack>
                </>
              ) : null}

              {bookingDetails?.reviewFromHost && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">{lastBooking?.host?.name}'s reviews:</Typography>
                  <Typography variant="body2">{bookingDetails?.reviewFromHost.message}</Typography>
                  <Typography onClick={() => actions.openPopup('showGuestReviews', bookingDetails)} variant="body2" fontWeight={600} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    Show reviews
                  </Typography>
                </>
              )}
            </>
          ) : lastBooking?.bookingStatus === 'CANCELED' ? (
            // 🛑 Booking canceled
            <Box mb={1}>
              <Typography variant="body1" fontWeight={500}>
                Booking canceled
              </Typography>
            </Box>
          ) : lastBooking?.paymentStatus === 'FAILED' || lastBooking?.paymentStatus === 'CANCELLED' ? (
            // ❌ Payment failed

            <Box mb={1}>
              <Typography variant="body1" fontWeight={500}>
                Payment Unsuccessful
              </Typography>
            </Box>
          ) : (['INQUIRY', 'REQUEST'].includes(lastBooking?.bookingType) && lastBooking?.bookingStatus === 'ACCEPTED') || lastBooking?.property?.bookingType == 'instant' ? (
            // 🎉 Host invited guest
            <Box mb={1}>
              <Typography variant="body1" fontWeight={500}>
                {hostName} invited {guestName} to book their home.
              </Typography>
            </Box>
          ) : ['INQUIRY'].includes(lastBooking?.bookingType) && lastBooking?.bookingStatus === 'PENDING' && lastBooking?.property?.bookingType == 'request' ? (
            // 📨 Request pending

            <Box mb={2}>
              <Typography variant="body1" fontWeight={500}>
                {guestName} messaged {hostName} about their listing.
              </Typography>
            </Box>
          ) : ['REQUEST'].includes(lastBooking?.bookingType) && lastBooking?.bookingStatus === 'PENDING' ? (
            // 📨 Request pending

            <Box mb={2}>
              <Typography variant="body1" fontWeight={500}>
                {guestName} requested {hostName} for booking.
              </Typography>
            </Box>
          ) : null}
        </Stack>
        {/* Special Offer logic — only if booking is not confirmed  */}

        {lastBooking?.bookingStatus !== 'CONFIRMED' && lastBooking?.specialOffer && (
          <Stack gap={2}>
            <Typography variant="body2" fontWeight={600}>
              {hostName} sent a special offer
            </Typography>
            <Typography variant="body2">
              <Typography component={'span'} variant="body2" fontWeight={600}>
                {lastBooking?.guest?.name}
              </Typography>{' '}
              can book his offer for the next <CountdownTimer expiredAt={lastBooking?.specialOffer?.expiredAt} /> hours.
            </Typography>
          </Stack>
        )}
      </Box>
      <Divider sx={{ my: 1 }} />
      {/* About Host */}
      <Box my={2}>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          About Host
        </Typography>

        <Stack py={0.5} component={Link} href={`/user/show/${lastBooking?.host?.id}`} direction={'row'} gap={1} alignItems={'center'}>
          <Avatar src={lastBooking?.host?.image} name={lastBooking?.host?.name} alt={lastBooking?.host?.name} round={true} size="25"></Avatar>
          <Typography variant="body2" color="text.secondary">
            {lastBooking?.host?.name}
          </Typography>
        </Stack>

        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton sx={{ color: 'text.primary' }}>
            <Phone size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {lastBooking?.host?.phone}
          </Typography>
        </Stack>

        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton sx={{ color: 'text.primary' }}>
            <Headset size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {formatDistanceToNow(lastBooking?.host?.hostAt)} hosting
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Trip Details */}
      <Box>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          Trip Details
        </Typography>

        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={1} component={Link} href={`/rooms/${lastBooking?.property?.id}`} target="_blank">
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {lastBooking?.property?.propertyDesc?.name}
            </Typography>
            <Typography variant="body2">
              {lastBooking?.property?.spaceType?.name} in {lastBooking?.property?.propertyType?.name} ·{' '}
              {lastBooking?.property?.propertyAddress?.addressLine1 || lastBooking?.property?.propertyAddress?.addressLine2}
            </Typography>
          </Stack>
          <IconButton sx={{ color: 'text.primary' }}>
            <ChevronRight />
          </IconButton>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Check-in
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lastBooking?.startDate ? format(new Date(lastBooking?.startDate), 'MMM dd, yyyy') : 'N/A'}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Check out
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lastBooking?.endDate ? format(new Date(lastBooking?.endDate), 'MMM dd, yyyy') : 'N/A'}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="body2" color="text.secondary">
            Guests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatGuestSummary(lastBooking?.guests)}
          </Typography>
        </Stack>

        {lastBooking?.bookingStatus == 'CONFIRMED' && (
          <>
            <Divider sx={{ my: 1 }} />
            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Booking date
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.confirmedAt && format(lastBooking?.confirmedAt, 'MMM dd, yyyy')}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Confirmation code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.confirmationCode && lastBooking?.confirmationCode}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Cancellation policy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.cancellationPolicy?.name}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />

            <Stack direction={'row'} justifyContent={'space-between'}>
              <Typography variant="body2" color="text.secondary">
                Booking Currency
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastBooking?.currency ? `${lastBooking.currency.symbol} (${lastBooking.currency.code})` : '-'}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
          </>
        )}
      </Box>
      {lastBooking?.bookingStatus != 'CONFIRMED' && <Divider sx={{ my: 1 }} />}

      {/* About Guest */}
      <Box>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          About Guest
        </Typography>
        <Stack py={0.5} component={Link} href={`/user/show/${lastBooking?.guest?.id}`} direction={'row'} gap={1} alignItems={'center'}>
          <Avatar src={lastBooking?.guest?.image} name={lastBooking?.guest?.name} alt={lastBooking?.guest?.name} round={true} size="25"></Avatar>
          <Typography variant="body2" color="text.secondary">
            {lastBooking?.guest?.name}
          </Typography>
        </Stack>

        {bookingDetails?.guestReviewCount > 0 && (
          <Stack onClick={() => actions.openPopup('guestReviews', bookingDetails)} sx={{ textDecoration: 'underline', cursor: 'pointer' }} direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Star size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              {bookingDetails?.guestOverallRating} rating from {bookingDetails?.guestReviewCount} reviews
            </Typography>
          </Stack>
        )}
        {lastBooking?.guest?.isVerified && (
          <Stack sx={{ textDecoration: 'underline' }} direction={'row'} alignItems={'center'} gap={1}>
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
            <Radius size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {bookingDetails?.guestTripsCount > 0 ? <>{bookingDetails?.guestTripsCount} trips</> : <>No trips yet!</>}
          </Typography>
        </Stack>
        {lastBooking?.guest?.isHost && (
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <PersonStanding size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              Also a host
            </Typography>
          </Stack>
        )}
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton sx={{ color: 'text.primary' }}>
            <HousePlus size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {lastBooking?.guest?.createdAt ? `Joined in ${format(new Date(lastBooking?.guest?.createdAt), 'yyyy')}` : 'Joined date not available'}
          </Typography>
        </Stack>

        {lastBooking?.guest?.address && (
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Home size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              Lives in {lastBooking?.guest?.address}
            </Typography>
          </Stack>
        )}
        {lastBooking?.guest?.languages && (
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Globe size={18} />
            </IconButton>
            <Typography variant="body2" color="text.primary">
              Speaks {lastBooking?.guest?.languages?.join(', ')}
            </Typography>
          </Stack>
        )}
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <IconButton sx={{ color: 'text.primary' }}>
            <Phone size={18} />
          </IconButton>
          <Typography variant="body2" color="text.primary">
            {lastBooking?.guest?.phone}
          </Typography>
        </Stack>
      </Box>
      <Divider sx={{ my: 1 }} />
      {/*  Earning summary */}
      <>
        {/* Price Visibility Indicator */}
        <Stack direction={'row'} gap={1} my={1} alignItems={'center'}>
          <Typography border={'1px solid'} bgcolor="violet" height={15} width={15}></Typography>
          <Typography variant="body2">Price is visible to the user</Typography>
        </Stack>
        {/* Guest */}
        <Box mb={2}>
          <Typography variant="body1" fontWeight={600} gutterBottom>
            Guest Payment Details
          </Typography>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">For {lastBooking?.totalNight} nights</Typography>
            <Stack gap={1}>
              <Typography variant="body2">
                {AdminConvertAndFormatToDefaultCurrency(lastBooking?.exchangeRatePropertyToBase, lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.totalPrice)}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.totalPrice,
                })}
              </Typography>
            </Stack>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Guest Service fee</Typography>
            <Stack gap={1}>
              <Typography variant="body2">
                +{AdminConvertAndFormatToDefaultCurrency(lastBooking?.exchangeRatePropertyToBase, lastBooking?.specialOffer ? lastBooking?.specialOffer?.guestFee : lastBooking?.totalGuestFee)}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer?.guestFee : lastBooking?.totalGuestFee,
                })}
              </Typography>
            </Stack>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">{lastBooking?.discountType == 'weekly' ? 'Weekly' : 'Monthly'} Discounts</Typography>
            <Stack gap={1}>
              <Typography variant="body2">
                -{AdminConvertAndFormatToDefaultCurrency(lastBooking?.exchangeRatePropertyToBase, lastBooking?.specialOffer ? lastBooking?.specialOffer?.guestFee : lastBooking?.totalDiscount)}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                -
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.totalDiscount,
                })}
              </Typography>
            </Stack>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Cleaning Charge</Typography>
            <Stack gap={1}>
              <Typography variant="body2">
                +{AdminConvertAndFormatToDefaultCurrency(lastBooking?.exchangeRatePropertyToBase, lastBooking?.specialOffer ? lastBooking?.specialOffer?.guestFee : lastBooking?.cleaningCharge)}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                +
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.cleaningCharge,
                })}
              </Typography>
            </Stack>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" fontWeight="600">
              Total
            </Typography>
            <Stack gap={1}>
              <Typography variant="body2" fontWeight="600">
                {AdminConvertAndFormatToDefaultCurrency(
                  lastBooking?.exchangeRatePropertyToBase,
                  lastBooking?.specialOffer
                    ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
                    : lastBooking?.grandTotal,
                )}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer
                    ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
                    : lastBooking?.grandTotal,
                })}
              </Typography>
            </Stack>
          </Box>

          {lastBooking?.bookingStatus === 'CONFIRMED' ? (
            lastBooking?.paymentStatus === 'PAID' && (
              <Box display="flex" justifyContent="space-between" mb={1} color="green">
                <Typography variant="body2" fontWeight="bold">
                  Paid
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {AdminConvertAndFormatToDefaultCurrency(
                    lastBooking?.exchangeRatePropertyToBase,
                    lastBooking?.specialOffer
                      ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
                      : lastBooking?.grandTotal,
                  )}
                </Typography>
              </Box>
            )
          ) : (
            <Box display="flex" justifyContent="space-between" mb={2} color={'orange'}>
              <Typography variant="body2" fontWeight="bold">
                Due
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {AdminConvertAndFormatToDefaultCurrency(
                  lastBooking?.exchangeRatePropertyToBase,
                  lastBooking?.specialOffer
                    ? lastBooking?.specialOffer?.price + lastBooking?.specialOffer?.guestFee + lastBooking?.cleaningCharge
                    : lastBooking?.grandTotal,
                )}
              </Typography>
            </Box>
          )}
        </Box>
        <Divider sx={{ my: 1 }} />
        {/* Host */}
        <Box mb={2}>
          <Typography variant="body1" fontWeight={600} gutterBottom>
            Host Payout
          </Typography>
          <Box sx={{ textDecoration: 'underline' }} display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">{lastBooking?.totalNight} night room fee</Typography>

            <Stack gap={1}>
              <Typography variant="body2">
                {AdminConvertAndFormatToDefaultCurrency(lastBooking?.exchangeRatePropertyToBase, lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.grandTotal)}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer?.price : lastBooking?.grandTotal,
                })}
              </Typography>
            </Stack>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Host Service fee ({hostFee}%)</Typography>
            <Stack gap={1}>
              <Typography variant="body2">
                - {AdminConvertAndFormatToDefaultCurrency(lastBooking?.exchangeRatePropertyToBase, lastBooking?.specialOffer ? lastBooking?.specialOffer.hostFee : lastBooking?.totalHostFee)}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                -{' '}
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer.hostFee : lastBooking?.totalHostFee,
                })}
              </Typography>
            </Stack>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" fontWeight="600">
              Total
            </Typography>
            <Stack gap={1}>
              <Typography variant="body2" fontWeight="600">
                {AdminConvertAndFormatToDefaultCurrency(
                  lastBooking?.exchangeRatePropertyToBase,
                  lastBooking?.specialOffer ? lastBooking?.specialOffer.price - lastBooking?.specialOffer.hostFee :  lastBooking?.grandTotal  - lastBooking?.totalHostFee,
                )}
              </Typography>
              <Typography variant="body2" fontWeight="500" color="violet">
                {convertAndFormatBookedCurrency({
                  orderCurrency: lastBooking?.currency,
                  exchangeRateToBase: lastBooking?.exchangeRateToBase,
                  exchangeRatePropertyToBase: lastBooking?.exchangeRatePropertyToBase,
                  price: lastBooking?.specialOffer ? lastBooking?.specialOffer.price - lastBooking?.specialOffer.hostFee :  lastBooking?.grandTotal - lastBooking?.totalHostFee,
                })}
              </Typography>
            </Stack>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Stack
          sx={{ cursor: 'pointer' }}
          onClick={() => actions.openPopup('transactionHistory', lastBooking?.confirmationCode)}
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Stack direction={'row'} gap={1} alignItems={'center'}>
            <IconButton sx={{ color: 'text.primary' }}>
              <Banknote />
            </IconButton>
            <Typography variant="subtitle2" fontWeight={500}>
              Transaction history
            </Typography>
          </Stack>
          <IconButton sx={{ color: 'text.primary' }}>
            <ChevronRight size={18} />
          </IconButton>
        </Stack>
      </>
    </Box>
  );
};

export default DetailsSidebar;
