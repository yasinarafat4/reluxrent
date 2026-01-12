import Layout from '@/components/layout/front/Layout';
import NoDataFound from '@/components/NoDataFound';
import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { Search } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, IconButton, InputAdornment, Stack, Tab, TextField, Typography } from '@mui/material';
import { getCookie } from 'cookies-next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const Help = ({ seoData, helpCategoriesData, helpsData }) => {
  console.log('helpSeoData', seoData);
  const { trans, lang } = useTranslation();
  const { user } = useAuth();
  const [value, setValue] = useState();
  const { data: helpCategories = [], isLoading: helpsCategoriesLoading } = useSWR(`/api/front/help-categories?lang=${lang.code}`, fetcher, { fallbackData: helpCategoriesData });

  const { data: helps = [], isLoading: helpsLoading } = useSWR(
    value ? `/api/front/helps/${value}?lang=${lang.code}` : null, // fetch only if value exists
    fetcher,
    { fallbackData: helpsData },
  );

  useEffect(() => {
    if (helpCategories?.length > 0 && !value) {
      setValue(helpCategories[0]?.id);
    }
  }, [helpCategories, value]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Head>
        <title>{seoData?.seoTitle}</title>
        <meta name="description" content={seoData?.seoDescription} />

        {/* OG & Twitter Meta */}
        <meta property="og:title" content={seoData?.seoTitle} />
        <meta property="og:description" content={seoData?.seoDescription} />
        <meta property="og:image" content={seoData?.seoImage} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_API_URL}/help`} />

        <meta name="twitter:title" content={seoData?.seoTitle} />
        <meta name="twitter:description" content={seoData?.seoDescription} />
        <meta name="twitter:image" content={seoData?.seoImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_API_URL}/help`} />
        {seoData?.structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoData?.structuredData }} />}
      </Head>
      <Layout>
        {!helpCategories || helpCategories.length < 0 ? (
          <NoDataFound title={'No help categories available at the moment. Please try again later.'} />
        ) : (
          <Box sx={{ backgroundColor: 'background.default', width: { xs: '100%', lg: '70%', xl: '60%' }, mx: 'auto' }}>
            <Stack mt={4}>
              {/* Header */}
              <Typography variant="h2" fontWeight={600} textAlign="center">
                Hi {user?.name}, how can we help?
              </Typography>

              {/* Search bar */}
              <Box display="flex" justifyContent="center" pr={0}>
                <TextField
                  placeholder="Search articles..."
                  variant="outlined"
                  sx={{
                    width: { xs: '100%', sm: '400px' },
                    py: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '27px',
                      pr: 1,
                    },
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              '&:hover': {
                                bgcolor: 'primary.main',
                              },
                            }}
                          >
                            <Search sx={{ color: 'common.white' }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Stack>

            {/* Tabs */}
            {
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange} aria-label="lab API tabs example">
                    {helpCategories?.map((category, i) => (
                      <Tab sx={{ textTransform: 'none' }} key={i} label={category?.title} value={category?.id} />
                    ))}
                  </TabList>
                </Box>

                {helpCategories?.map((category, i) => (
                  <TabPanel sx={{ px: 0 }} key={i} value={category?.id}>
                    {/* Guides Section */}
                    {helps.length > 0 ? (
                      <Box
                        display="flex"
                        flexDirection="column"
                        flexWrap="wrap"
                        sx={{
                          height: 5 * 32, // 5 items * itemHeight (adjust this!)
                          maxHeight: 5 * 32,
                        }}
                      >
                        {helps?.map((help, i) => (
                          <Typography key={i} component={Link} href={`/help/${help?.slug}`} sx={{ textDecoration: 'underline', height: 32 }} variant="body2">
                            {help?.title}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="subtitle1" color="error.main">
                        No {category?.title} data found!
                      </Typography>
                    )}
                  </TabPanel>
                ))}
              </TabContext>
            }
          </Box>
        )}
      </Layout>
    </>
  );
};

export default Help;

export async function getServerSideProps(context) {
  try {
    const siteLang = getCookie('siteLang', { req: context.req, res: context.res });
    const langCode = siteLang?.code || 'en';

    const seoData = await fetcher(`/api/front/seo/help`);

    const helpCategoriesData = await fetcher(`/api/front/help-categories?lang=${langCode}`);

    let helpsData = [];
    if (helpCategoriesData?.length > 0) {
      helpsData = await fetcher(`/api/front/helps/${helpCategoriesData[0].id}?lang=${langCode}`);
    }

    return {
      props: {
        seoData,
        helpCategoriesData,
        helpsData,
      },
    };
  } catch (error) {
    console.error('Help page SSR error:', error);
    return {
      props: {
        seoData: [],
        helpCategoriesData: [],
        helpsData: [],
      },
    };
  }
}
