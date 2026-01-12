import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import api from '@/lib/api';
import { Box, Divider, FormControlLabel, InputAdornment, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, SaveButton, SimpleForm, TopToolbar, useDataProvider, useNotify, useRecordContext, useRefresh } from 'react-admin';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useFormContext } from 'react-hook-form';

const PriceInput = ({ selectedDate }) => {
  const record = useRecordContext();
  console.log('record', record);

  const { setValue } = useFormContext();
  const [available, setAvailable] = useState();
  const [price, setPrice] = useState();
  const { guestFee, hostFee } = useReluxRentAppContext();

  const hostFees = record.host.hostFee ? record.host.hostFee : hostFee;
  const guestFeeTotal = parseFloat(((parseFloat(price) / 100) * guestFee).toFixed(2));
  const hostFeeTotal = parseFloat(((parseFloat(price) / 100) * hostFees).toFixed(2));

  useEffect(() => {
    const formatted = format(selectedDate, 'yyyy-MM-dd');
    const status = record?.dateWisePrices[formatted]?.status ?? true;
    const price = record?.dateWisePrices[formatted]?.price || record?.propertyPrice?.price;
    setPrice(price);
    setAvailable(status);
  }, [selectedDate]);

  useEffect(() => {
    setValue('id', record.id);
    setValue('price', price);
    setValue('date', selectedDate);
    setValue('status', available);
  }, [record, selectedDate, available, price]);

  return (
    <>
      {/* Status */}
      <Stack direction="row" justifyContent={'space-between'} alignItems="center" spacing={1}>
        <FormControlLabel control={<Switch onChange={() => setAvailable(!available)} checked={available} />} label={available ? 'Available' : 'Blocked'} />
      </Stack>
      {/* <NumberInput
        source="price"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">{record?.propertyPrice?.currency?.symbol}</InputAdornment>,
          },
        }}
      /> */}

      {/* Input */}
      <TextField
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">{record?.propertyPrice?.currency?.symbol}</InputAdornment>,
          },
        }}
        variant="outlined"
      />

      <Stack p={0} width={'100%'} gap={2}>
        {/* Guest price */}
        <Box width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
          <Typography fontSize={14} fontWeight={600} mb={0.5}>
            Guest price before taxes
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={14}>Base price</Typography>
            <Typography fontWeight={600} fontSize={14}>
              {record?.propertyPrice?.currency?.symbol}
              {price}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={14}>Guest service fee</Typography>
            <Typography fontWeight={600} fontSize={14}>
              {record?.propertyPrice?.currency?.symbol}
              {guestFeeTotal}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: '#555', my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={14}>Total</Typography>
            <Typography fontWeight={600} fontSize={14}>
              {record?.propertyPrice?.currency?.symbol}
              {(Number(price) + Number(guestFeeTotal).toFixed(2))}
            </Typography>
          </Box>
        </Box>

        {/* Host price */}
        <Box width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
          <Typography fontSize={14} fontWeight={600} mb={0.5}>
            Host will earn
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={14}>Base price</Typography>
            <Typography fontWeight={600} fontSize={14}>
              {record?.propertyPrice?.currency?.symbol}
              {price}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={14}>Host service fee</Typography>
            <Typography fontWeight={600} fontSize={14}>
              -{record?.propertyPrice?.currency?.symbol}
              {hostFeeTotal}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: '#555', my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography fontSize={14}>Total</Typography>
            <Typography fontWeight={600} fontSize={14}>
              {record?.propertyPrice?.currency?.symbol}
              {(Number(price) - Number(hostFeeTotal).toFixed(2))}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </>
  );
};

const DateWisePriceSettingsToolber = () => {
  const {
    getValues,
    handleSubmit,
    formState: { isValid },
  } = useFormContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const formValues = getValues();
    setLoading(true);
    try {
      await api.post('/api/properties/update/date-wise-price', {
        id: formValues.id,
        status: formValues.status,
        price: formValues.price,
        date: formValues.date,
      });

      notify('Date wise price updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating date wise price', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TopToolbar sx={{ p: 0 }}>
      <SaveButton alwaysEnable type="button" onClick={handleSubmit(onSubmit)} disabled={loading} />
    </TopToolbar>
  );
};
const PriceSettings = () => {
  const record = useRecordContext();
  const { guestFee, hostFee } = useReluxRentAppContext();

  const hostFees = record.host.hostFee ? record.host.hostFee : hostFee;

  const totalGuestFee = parseFloat(((parseFloat(record?.propertyPrice?.price) / 100) * guestFee).toFixed(2));
  const totalHostFee = parseFloat(((parseFloat(record?.propertyPrice?.price) / 100) * hostFees).toFixed(2));

  console.log('guestFee', guestFee);
  return (
    <Paper sx={{ width: '100%' }} elevation={3}>
      {/* Title */}
      <Typography textAlign={'center'} px={2} py={1.5} fontSize={16} fontWeight={600}>
        Price Settings
      </Typography>
      <Divider />
      <Stack px={2} py={1} gap={1.5}>
        {/* Base price */}
        <Stack spacing={1}>
          <Typography fontSize={16} fontWeight={500}>
            Base Price
          </Typography>

          {/* Guest price */}
          <Box width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
            <Typography fontSize={14} fontWeight={600} mb={0.5}>
              Guest price before taxes
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={14}>Base price</Typography>
              <Typography fontWeight={600} fontSize={14}>
                {record?.propertyPrice?.currency?.symbol}
                {record?.propertyPrice?.price}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={14}>Guest service fee</Typography>
              <Typography fontWeight={600} fontSize={14}>
                {record?.propertyPrice?.currency?.symbol}
                {totalGuestFee}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: '#555', my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={14}>Total</Typography>
              <Typography fontWeight={600} fontSize={14}>
                {record?.propertyPrice?.currency?.symbol}
                {(parseFloat(record?.propertyPrice?.price) + totalGuestFee).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Host price */}
          <Box width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
            <Typography fontSize={14} fontWeight={600} mb={0.5}>
              Host will earn
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={14}>Base price</Typography>
              <Typography fontWeight={600} fontSize={14}>
                {record?.propertyPrice?.currency?.symbol}
                {record?.propertyPrice?.price}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={14}>Host service fee</Typography>
              <Typography fontWeight={600} fontSize={14}>
                -{record?.propertyPrice?.currency?.symbol}
                {totalHostFee}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: '#555', my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontSize={14}>Total</Typography>
              <Typography fontWeight={600} fontSize={14}>
                {record?.propertyPrice?.currency?.symbol}
                {(parseFloat(record?.propertyPrice?.price) - totalHostFee).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Discounts */}
        <Stack spacing={1}>
          <Typography fontSize={16} fontWeight={500}>
            Discounts
          </Typography>

          {/* Weekly */}
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={0.5}>
                Weekly Discount
              </Typography>
              <Typography fontWeight={500} fontSize={14}>
                Average for a 7-nights stay
              </Typography>
            </Box>
            <Typography p={0.5} fontSize={20} fontWeight={600} border={'1px solid'} borderColor={'divider'} borderRadius={1}>
              {record.propertyPrice?.weeklyDiscount}%
            </Typography>
          </Stack>

          {/* Monthly */}
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={0.5}>
                Monthly Discount
              </Typography>
              <Typography fontWeight={500} fontSize={14}>
                Average for a 28-nights stay
              </Typography>
            </Box>
            <Typography p={0.5} fontSize={20} fontWeight={600} border={'1px solid'} borderColor={'divider'} borderRadius={1}>
              {record.propertyPrice?.monthlyDiscount}%
            </Typography>
          </Stack>
        </Stack>

        {/* Additional Charges */}
        <Stack spacing={1}>
          <Typography fontSize={16} fontWeight={500}>
            Additional Charges
          </Typography>

          {/* Cleaning fee */}
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={0.5}>
                Cleaning fee
              </Typography>
              <Typography fontWeight={500} fontSize={14}>
                Per stay
              </Typography>
            </Box>
            <Typography p={0.5} fontSize={25} fontWeight={600}>
              {record?.propertyPrice?.currency?.symbol}
              {record?.propertyPrice?.cleaningFee}
            </Typography>
          </Stack>

          {/* Extra guest fee */}
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'} border={'1px solid'} borderColor={'divider'} borderRadius={2} px={1.5} py={1}>
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={0.5}>
                Extra guest fee
              </Typography>
              <Typography fontWeight={500} fontSize={14}>
                After {record?.propertyPrice?.guestAfter} guest, per night
              </Typography>
            </Box>
            <Typography p={0.5} fontSize={25} fontWeight={600}>
              {record?.propertyPrice?.currency?.symbol}
              {record?.propertyPrice?.guestAfterFee}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

const DateWisePriceSettings = ({ selectedDate, setSelectedDate }) => {
  const record = useRecordContext();

  return (
    <Paper sx={{ width: '100%' }} elevation={3}>
      {/* Title */}
      <Typography textAlign={'center'} px={2} py={1.5} fontSize={16} fontWeight={600}>
        Date wise Price Settings
      </Typography>
      <Divider />
      <Box px={2} py={1}>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} gap={0.5}>
            <CalendarDays size={20} />
            <Typography>{format(selectedDate, 'dd-MM-yyyy')}</Typography>
          </Stack>
          <Button onClick={() => setSelectedDate(null)}>Clear date</Button>
        </Stack>
        {/* Form */}
        <SimpleForm sx={{ p: 0 }} toolbar={<DateWisePriceSettingsToolber />}>
          <PriceInput selectedDate={selectedDate} />
        </SimpleForm>
      </Box>
    </Paper>
  );
};

const CalendarTab = () => {
  const [selected, setSelected] = useState();
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState(true);
  const [selectedDate, setSelectedDate] = useState();
  const [openDrawer, setOpenDrawer] = useState(false);
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const record = useRecordContext();
  console.log('CalenderTabRecord', record);
  const refresh = useRefresh();
  const handleSave = async () => {
    if (!record || !selected) return;

    try {
      // Save the price and availability for the selected date
      await dataProvider.update('properties/calender', {
        id: record.id,
        data: {
          selected,
          price,
          availability,
        },
      });

      notify('Calendar updated successfully', { type: 'success' });
      refresh();
    } catch (error) {
      console.error('Error:', error);
      notify('Error updating calendar', { type: 'error' });
    }
  };

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (date < new Date()) return true;
    if (record?.dateWisePrices?.[formattedDate]?.status === false) {
      return true;
    }
    return false;
  };

  const MyCustomDayButton = ({ day, selected, propertyData, className, disabled, ...props }) => {
    const date = new Date(day.date);
    date.setHours(0, 0, 0, 0);

    const formatted = format(day?.date, 'yyyy-MM-dd');
    const price = propertyData?.dateWisePrices[formatted]?.price || propertyData?.propertyPrice?.price;

    return (
      <>
        <button className={`${className} admin-calender`} {...props}>
          <Stack height={'100%'} width={'100%'} justifyContent={'center'} alignItems={'center'} gap={0.5}>
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
    <>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ flex: '1', marginBottom: '1em' }}>
          Select Date and Set Price/Availability
        </Typography>
        <Stack width={'100%'} direction={'row'} spacing={2}>
          <Box flex={1} width={'70%'}>
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
                  DayButton: (props) => <MyCustomDayButton {...props} propertyData={record} />,
                }}
              />
            </Box>
          </Box>
          <Box width={'30%'}>{selectedDate ? <DateWisePriceSettings selectedDate={selectedDate} setSelectedDate={setSelectedDate} /> : <PriceSettings />}</Box>
        </Stack>
      </Box>
    </>
  );
};

export default CalendarTab;
