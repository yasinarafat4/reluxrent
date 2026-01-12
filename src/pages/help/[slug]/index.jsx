import Layout from '@/components/layout/front/Layout';
import NoDataFound from '@/components/NoDataFound';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Stack, Typography } from '@mui/material';
import { getCookie } from 'cookies-next';
import moment from 'moment';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const Help = ({ helpData }) => {
  const router = useRouter();
  const { slug } = router.query;
  const { trans, lang } = useTranslation();

  const { data: help } = useSWR(`/api/front/help/${slug}?lang=${lang.code}`, fetcher, { fallbackData: helpData });
  console.log('help', help);

  return (
    <>
      <Head>
        <title>{help?.seoTitle} - Reluxrent</title>
        <meta name="description" content={help?.seoDescription} />

        {/* OG & Twitter Meta */}
        <meta property="og:title" content={help?.seoTitle} />
        <meta property="og:description" content={help?.seoDescription} />
        <meta property="og:image" content={help?.seoImage} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_API_URL}/help/${slug}`} />

        <meta name="twitter:title" content={help?.seoTitle} />
        <meta name="twitter:description" content={help?.seoDescription} />
        <meta name="twitter:image" content={help?.seoImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_API_URL}/help/${slug}`} />
        {help?.structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: help?.structuredData }} />}
      </Head>
      <Layout>
        <Stack direction={'row'} justifyContent={'start'} alignItems={'start'} gap={1}>
          <Typography component={Link} href={`/help`} variant="body2">
            {trans('Help')}
          </Typography>
          <NavigateNextIcon fontSize="small" />
          <Typography
            variant="body2"
            noWrap
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            {help?.helpCategory?.title}
          </Typography>
          {help?.helpCategory?.title && <NavigateNextIcon fontSize="small" />}
          <Typography
            variant="body2"
            noWrap
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
              maxWidth: { xs: 200, sm: '100%' },
              flexShrink: 1,
            }}
          >
            ReluxRent {help?.title || slug}
          </Typography>
        </Stack>
        <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
          {Object.keys(help || {}).length === 0 ? (
            <NoDataFound
              title="No Help Articles Found!"
              subtitle={`It looks like there's no help content available for “${slug}” right now. Please check back later or reach out to our support team if you need assistance.`}
            />
          ) : (
            <Stack gap={2} mt={3}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {help.title}
                </Typography>
                <Typography variant="body2">
                  {trans('Last Updated')}: {moment(help.updatedAt).format('ll')}
                </Typography>
              </Box>
              <Typography className="editor-content" component="div" dangerouslySetInnerHTML={{ __html: help.content }} />
            </Stack>
          )}
        </Box>
      </Layout>
    </>
  );
};

export default Help;

export async function getServerSideProps(context) {
  try {
    const slug = context.query.slug;
    const siteLang = getCookie('siteLang', { req: context.req, res: context.res });
    const langCode = siteLang?.code || 'en';

    const [helpData] = await Promise.all([fetcher(`/api/front/help/${slug}?lang=${langCode}`)]);

    return {
      props: {
        helpData,
      },
    };
  } catch (error) {
    console.log('Error', error);

    return {
      props: {
        helpData: [],
      },
    };
  }
}
