import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { convertAndFormatToActiveCurrency } from '@/utils/convertAndFormatPrice';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const HorizontalPropertyCard = ({ property }) => {
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const isWishlist = wishlist.some((item) => item.id == property.id);
  const { trans } = useTranslation();

  return (
    <Card
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '40%' },
          height: { xs: 150, sm: 150 },
          flexShrink: 0,
        }}
      >
        <Image src={property?.propertyImages?.[0]?.image || '/placeholder.jpg'} alt={property?.propertyType?.name || 'Property'} fill style={{ objectFit: 'cover' }} />
      </Box>

      {/* Content Section */}
      <CardContent
        sx={{
          position: 'relative',
          flex: 1,
          p: { xs: 2, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Wishlist Icon */}
        <IconButton
          onClick={() => (user ? toggleWishlist(property.id) : actions.openPopup('login', {}))}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'divider',
            border: '1px solid',
            borderColor: 'divider',
            p: .7,
            zIndex: 2,
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
        {/* Property Title */}
        <Typography
          component={Link}
          href={`/rooms/${property?.id}`}
          fontSize={{ xs: 14, sm: 15 }}
          fontWeight={600}
          sx={{
            color: 'text.primary',
            textDecoration: 'none',
            textTransform: 'capitalize',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {property?.propertyDescription?.name
            ? property?.propertyDescription?.name
            : `${property?.propertyType?.name} in ${property?.propertyAddress?.city?.name}, ${property?.propertyAddress?.country?.name}`}
        </Typography>

        {/* Location */}
        <Typography
          fontSize={{ xs: 12, sm: 13 }}
          color="text.secondary"
          mt={0.5}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {property?.propertyAddress?.city?.name}, {property?.propertyAddress?.country?.name}
        </Typography>

        {/* Price and Rating */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1.5} flexWrap="wrap">
          <Typography fontSize={{ xs: 13, sm: 14 }} fontWeight={500}>
            {convertAndFormatToActiveCurrency(property?.propertyPrice?.currency, property?.propertyPrice?.price)}{' '}
            <Typography component="span" fontSize={{ xs: 13, sm: 14 }} color="text.secondary">
              per night
            </Typography>
          </Typography>

          <Box display="flex" alignItems="center" gap={0.4}>
            <Star size={15} color="#ffdc36" strokeWidth={3} />
            <Typography fontSize={{ xs: 13, sm: 14 }} fontWeight={500}>
              {property.overallRating || 0} ({property.reviewCount || 0})
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HorizontalPropertyCard;
