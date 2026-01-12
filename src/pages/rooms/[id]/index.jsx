import Layout from '@/components/layout/front/Layout';
import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useWishlist } from '@/contexts/WishlistContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import { serialize } from '@/utils/serialize';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Button, Typography } from '@mui/material';
import { getCookie } from 'cookies-next';
import { Share } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';
import HostSection from '../partials/HostSection';
import ImageGallery from '../partials/ImageGallery';
import ReviewSummary from '../partials/ReviewSummary';
import RoomDetails from '../partials/RoomDetails';
import ThingsToKnow from '../partials/ThingsToKnow';

const PropertyDetails = ({ propertyResData }) => {
  const { trans, lang } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { actions } = usePopups();
  const { data: propertyData = [], isLoading } = useSWR(`/api/front/property/${id}?lang=${lang.code}`, fetcher, { fallbackData: propertyResData });
  console.log('PropertyDetailsData', propertyData);

  console.log('propertyResData', propertyResData);

  useEffect(() => {
    if (user && propertyData?.id) {
      async function addRecentlyViewed() {
        try {
          await api.post('/api/guest/add-recently-viewed', { propertyId: propertyData.id });
        } catch (error) {
          console.log('Error adding recently viewed:', error);
        }
      }
      addRecentlyViewed();
    }
  }, [propertyData?.id, user]);

  const isWishlist = wishlist.some((item) => item.id == propertyData?.id);

  const share = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          url: url,
        })
        .then(() => console.log('Page shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      alert('Your browser does not support the Share API. You can copy the link below.');
      console.log('Share this link:', url);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{propertyData?.propertyDescription?.name} - Reluxrent</title>
        <meta name="description" content={propertyData?.propertyDescription?.description} />

        {/* OG & Twitter Meta */}
        <meta property="og:title" content={propertyData?.propertyDescription?.name} />
        <meta property="og:description" content={propertyData?.propertyDescription?.description} />
        <meta property="og:image" content={propertyData?.propertyImages[0]?.image} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`} />

        <meta name="twitter:title" content={propertyData?.propertyDescription?.name} />
        <meta name="twitter:description" content={propertyData?.propertyDescription?.description} />
        <meta name="twitter:image" content={propertyData?.propertyImages[0]?.image} />

        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`} />
      </Head>
      <Layout>
        <Box>
          <Box width={'100%'} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', sm: 'center' } }} mb={1}>
            <Typography variant="h6" fontWeight={600}>
              {propertyData?.propertyDescription?.name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={() => share()}
                size="small"
                variant="outlined"
                startIcon={<Share size={15} />}
                sx={{
                  textTransform: 'none',
                }}
              >
                {trans('Share')}
              </Button>
              <Button
                onClick={() => (user ? toggleWishlist(propertyData.id) : actions.openPopup('login', {}))}
                size="small"
                variant="outlined"
                startIcon={
                  isWishlist ? (
                    <FavoriteIcon
                      sx={{
                        color: 'primary.main',
                        fontSize: 18,
                      }}
                    />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                  )
                }
                sx={{
                  textTransform: 'none',
                }}
              >
                {trans(`${isWishlist ? 'Saved' : 'Save'}`)}
              </Button>
            </Box>
          </Box>
          <ImageGallery propertyImages={propertyData.propertyImages} />
          <RoomDetails propertyData={propertyData} />
          <ReviewSummary propertyData={propertyData} />
          <HostSection propertyData={propertyData} />
          <ThingsToKnow propertyData={propertyData} />
        </Box>
      </Layout>
    </>
  );
};

export default PropertyDetails;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const siteLang = getCookie('siteLang', { req: context.req, res: context.res });
    const langCode = siteLang?.code || 'en';
    // const [propertyResData] = await Promise.all([fetcher(`/api/front/property/${id}?lang=${langCode}`)]);

    // Dynamic import of CommonJS service
    const { getPropertyById } = await import('../../../../services/propertyService.js');

    const propertyResData = await getPropertyById(id, langCode);

    return {
      props: {
        propertyResData: serialize(propertyResData),
      },
    };
  } catch (error) {
    console.error('API Error in getServerSideProps:', error);

    // Redirect to /500 page
    return {
      redirect: {
        destination: '/error',
        permanent: false,
      },
    };
  }
}
