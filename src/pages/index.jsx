import Layout from '@/components/layout/front/Layout';
import Property from '@/components/Property';
import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Box } from '@mui/material';
import Head from 'next/head';
import { useEffect } from 'react';
import useSWR from 'swr';

export default function Home({ popularCitiesData, seoData }) {
  console.log('seoData', seoData);
  const { trans } = useTranslation();
  const { user, needProfileUpdate } = useAuth();
  const { actions } = usePopups();

  const { data: popularCities, isLoading: popularCitiesLoading } = useSWR(`/api/front/popular-city`, fetcher, { fallbackData: popularCitiesData });

  useEffect(() => {
    if (!user) return;

    if (user && needProfileUpdate) {
      actions.openPopup('profileEdit', {});
    }
  }, [user, needProfileUpdate]);

  return (
    <>
      <Head>
        <title>{seoData?.seoTitle}</title>
        <meta name="description" content={seoData?.seoDescription} />

        {/* OG & Twitter Meta */}
        <meta property="og:title" content={seoData?.seoTitle} />
        <meta property="og:description" content={seoData?.seoDescription} />
        <meta property="og:image" content={seoData?.seoImage} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_API_URL}`} />

        <meta name="twitter:title" content={seoData?.seoTitle} />
        <meta name="twitter:description" content={seoData?.seoDescription} />
        <meta name="twitter:image" content={seoData?.seoImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_API_URL}`} />
        {seoData?.structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoData?.structuredData }} />}
      </Head>
      <Layout>
        <Box p={0} width={'100%'}>
          {popularCities.map((city, i) => (
            <Property key={i} city={city} />
          ))}
        </Box>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  let popularCitiesData = [];
  let seoData = {};

  try {
    popularCitiesData = await fetcher(`/api/front/popular-city`);
  } catch (error) {
    console.error('Popular cities fetch error:', error);
    // fallback to empty array
    popularCitiesData = [];
  }

  try {
    seoData = await fetcher(`/api/front/seo/home`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn('SEO data not found, using default:', error.message);
      seoData = {}; // fallback
    } else {
      console.error('SEO fetch error:', error);
      seoData = {}; // fallback
    }
  }

  return {
    props: {
      popularCitiesData,
      seoData,
    },
  };
}
