import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { convertAndFormatToActiveCurrency } from '@/utils/convertAndFormatPrice';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const PropertyCard = ({ property }) => {
  console.log('PropertyCard', property);
  const { user } = useAuth();
  const router = useRouter();
  const { actions } = usePopups();
  const { wishlist, toggleWishlist } = useWishlist();
  const isWishlist = wishlist.some((item) => item.id == property.id);

  return (
    <Box
      sx={{
        // width: '100%',
        // position: 'relative',
        // alignSelf: 'flex-start',
        // my: 1,
        // transition: 'transform 0.2s ease',
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease',
      }}
    >
      <Box width={'100%'} position="relative">
        {/* Favorite Icon */}
        <IconButton
          onClick={() => (user ? toggleWishlist(property.id) : actions.openPopup('login', {}))}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'common.white',
            border: '1px solid white',
            p: 0.5,
            zIndex: 2,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: 'common.white',
            },
          }}
        >
          {isWishlist ? (
            <FavoriteIcon
              sx={{
                color: 'primary.main',
                fontSize: 18,
              }}
            />
          ) : (
            <FavoriteBorderIcon sx={{ color: 'common.black', fontSize: 18 }} />
          )}
        </IconButton>

        {/* Image with link */}
        <a href={`/rooms/${property?.id}`} target="_blank" rel="noopener noreferrer">
          <Box sx={{ width: '100%', height: '200px', position: 'relative', borderRadius: 1 }}>
            <Image src={property?.propertyImages[0]?.image} alt={property?.propertyType?.name} fill style={{ objectFit: 'cover', borderRadius: '12px' }} />
          </Box>
          <Box width={'100%'} sx={{ py: 1, '&:last-child': { pb: 1 } }}>
            <Typography
              fontSize={{ xs: 12, sm: 14 }}
              fontWeight={500}
              sx={{
                textTransform: 'capitalize',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                flexShrink: 1,
                maxWidth: '100%',
              }}
            >
              {property?.propertyDescription?.name
                ? property?.propertyDescription?.name
                : `${property?.propertyType?.name} in ${property?.propertyAddress?.city?.name}, ${property?.propertyAddress?.country?.name}`}
            </Typography>
            <Stack direction="row" justifyContent={'space-between'} alignItems="center">
              <Typography fontSize={{ xs: 12, sm: 14 }}> {convertAndFormatToActiveCurrency(property.propertyPrice?.currency, property?.propertyPrice?.price)} for 1 night</Typography>
              <Typography display={'flex'} alignItems={'center'} gap={0} fontSize={{ xs: 12, sm: 14 }}>
                <IconButton
                  sx={{
                    p: 0,
                    width: { xs: 10, sm: 15 },
                    height: { xs: 10, sm: 15 },
                  }}
                >
                  <Star strokeWidth={3} color="#ffdc36" />
                </IconButton>
                {property.overallRating || 0}({property.reviewCount || 0})
              </Typography>
            </Stack>
          </Box>
        </a>
      </Box>
    </Box>
  );
};

export default PropertyCard;
