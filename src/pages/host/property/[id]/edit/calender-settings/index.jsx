import HostingLayout from '@/components/layout/host/HostingLayout';
import { useTranslation } from '@/contexts/TranslationContext';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { getCookie } from 'cookies-next';
import { format } from 'date-fns';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import useSWR from 'swr';
import Sidebar from '../../Sidebar';
import DailyPriceSettings from './partials/DailyPriceSettings';
import PriceSettings from './partials/PriceSettings';

const CalenderSettings = ({ singlePropertyData }) => {
  const { trans, lang } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const { id } = router.query;
  const [selectedDate, setSelectedDate] = useState();
  const [openDrawer, setOpenDrawer] = useState(false);

  const { data: propertyData, isLoading: propertyDataLoading } = useSWR(`/api/host/property/${id}?lang=${lang}`, fetcher, { fallbackData: singlePropertyData });

  const conditionalMarginLeft = propertyData.allStepsCompleted ? { md: '400px', lg: '0' } : {};

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  // const refetch = async () => {
  //   const { data } = await api.get(`/api/host/property/${id}&lang=${lang.code}`);
  //   setPropertyDataState(data.data);
  // };

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (propertyData?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    return false;
  };

  const MyCustomDayButton = ({ day, selected, propertyData, className, modifiers, disabled, ...props }) => {
    console.log('props', props);
    const date = new Date(day.date);
    date.setHours(0, 0, 0, 0);

    const formatted = format(day?.date, 'yyyy-MM-dd');
    const price = propertyData?.dateWisePrices[formatted]?.price || propertyData?.propertyPrice?.price;

    return (
      <>
        <button className={`${className} settings-calender`} {...props}>
          <Stack onClick={() => handleDrawerToggle()} height={'100%'} width={'100%'} justifyContent={'center'} alignItems={'center'} gap={0.5}>
            <Typography fontSize={{ xs: 12, sm: 18 }} fontWeight={600} className={disabled ? 'line-through text-red-400' : ''}>
              {day.date.getDate()}
            </Typography>
            <Typography variant="body2" fontSize={{ xs: 10, sm: 15 }} fontWeight={500}>
              {propertyData?.propertyPrice?.currency?.symbol}
              {price}
            </Typography>
          </Stack>
        </button>
      </>
    );
  };

  return (
    <HostingLayout>
      <Box px={2} pt={2} pb={12}>
        {propertyData.allStepsCompleted && !isXs && <Sidebar id={id} />}
        <Box sx={{ ml: conditionalMarginLeft }}>
          <Box
            sx={{
              width: { xs: '100%', lg: '44%', xl: '45%' },
              mx: 'auto',
            }}
          >
            {/* Small device back button */}
            <Stack color={'text.primary'} direction={'row'} justifyContent={'space-between'} alignItems={'center'} sx={{ p: 0, display: { md: 'none' } }}>
              {propertyData.allStepsCompleted && (
                <IconButton component={Link} href={`/host/property/${id}`} color="inherit" sx={{ border: '1px solid', borderColor: 'divider', p: '6px' }}>
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
              <IconButton sx={{ display: { xs: 'block', lg: 'none' } }} onClick={handleDrawerToggle}>
                <Settings color="#000" />
              </IconButton>
            </Stack>
            {/* Title */}
            <Box my={3} width={'100%'}>
              <Typography variant="h2">{trans('Calender')}</Typography>
              <Typography variant="subtitle1">{trans('Select your preferred check-in and check-out dates to see availability and prices.')}</Typography>
            </Box>

            {/* Calender Settings */}
            <Box
              sx={[
                (theme) => ({
                  display: 'flex',
                  width: '100%',
                  minHeight: '100%',
                  flexDirection: { xs: 'column-reverse', md: 'row' },
                }),
                (theme) =>
                  theme.applyStyles('dark', {
                    // bgcolor: ,
                    // color:,
                  }),
              ]}
            >
              {/* Left: Calendar */}
              <Box
                flex={1}
                sx={{
                  width: { xs: '100%', lg: '80%' },
                }}
              >
                <Box className="calendar-container" sx={{ mt: 2, width: '100%', mx: 'auto' }}>
                  <DayPicker
                    mode="single"
                    numberOfMonths={1}
                    navLayout="around"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disableDate}
                    excludeDisabled
                    captionLayout="dropdown"
                    components={{
                      DayButton: (props) => <MyCustomDayButton {...props} propertyData={propertyData} />,
                    }}
                  />
                </Box>
              </Box>

              {/* Small Device Sidebar  */}
              <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleDrawerToggle}
                sx={{
                  display: { xs: 'block', lg: 'none' },
                  zIndex: 1060,
                }}
              >
                <Box
                  sx={{
                    width: 330,
                    py: 10,
                    px: 1,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                    <IconButton onClick={handleDrawerToggle} sx={{ px: 1 }}>
                      <CloseIcon sx={{ color: 'text.primary', fontSize: '22px' }} />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      width: { xs: '100%' },
                      height: { xs: '100%' },
                      overflow: 'auto',
                    }}
                  >
                    {selectedDate ? (
                      <DailyPriceSettings selectedDate={selectedDate} setSelectedDate={setSelectedDate} propertyDataState={propertyData} />
                    ) : (
                      <PriceSettings propertyDataState={propertyData} />
                    )}
                  </Box>
                </Box>
              </Drawer>

              {/* Large Device Sidebar */}
              <Box
                sx={{
                  width: { lg: '25%' },
                  height: '100%',
                  overflow: 'auto',
                  borderLeft: '1px solid',
                  borderLeftColor: 'divider',
                  position: 'fixed',
                  top: '70px',
                  right: 0,
                  pb: '70px',
                  display: { xs: 'none', lg: 'block' },
                }}
              >
                {selectedDate ? (
                  <DailyPriceSettings selectedDate={selectedDate} setSelectedDate={setSelectedDate} propertyDataState={propertyData} />
                ) : (
                  <PriceSettings propertyDataState={propertyData} />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </HostingLayout>
  );
};

export default CalenderSettings;

export async function getServerSideProps(context) {
  try {
    const id = context.params.id;
    const lang = await getCookie('siteLang', { req: context.req, res: context.res });
    const cookies = context.req.headers.cookie || '';

    const [singlePropertyData] = await Promise.all([api.get(`/api/host/property/${id}?lang=${lang.code}`, { headers: { Cookie: cookies } }).then((res) => res.data || [])]);

    return {
      props: {
        singlePropertyData,
      },
    };
  } catch (error) {
    return {
      props: {
        singlePropertyData: [],
      },
    };
  }
}
