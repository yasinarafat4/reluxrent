import { Button, Stack } from '@mui/material';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const CalendarComponent = ({ selectedDate, setSelectedDate, propertyDataState }) => {
  console.log('propertyData', propertyDataState);

  const disableDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return propertyDataState?.dateWisePrices?.[formattedDate]?.status == false || date < new Date();
  };

  const MyCustomDayButton = ({ day, propertyData, ...props }) => {
    // console.log('props', props.modifiers.selected);
    const formatted = format(day?.date, 'yyyy-MM-dd');

    const price = propertyData?.dateWisePrices[formatted]?.price || propertyData?.propertyPrice?.price;

    return (
      <Button
        sx={{
          width: { xs: '10px !important', lg: '100px !important' },
          height: { xs: '10px !important', lg: '100px !important' },
          border: '',
          '&.Mui-disabled': {
            cursor: 'not-allowed !important',
            pointerEvents: 'auto',
          },
        }}
        {...props}
      >
        <Stack gap={1}>
          <span className={`${props.modifiers.disabled ? 'line-through text-red-400' : ''} text-2xl`}>{day.date.getDate()}</span>
          <span className="text-sm">{price}</span>
        </Stack>
      </Button>
    );
  };
  return (
    <DayPicker
      className="notranslate"
      animate
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      modifiers={{
        selected: selectedDate,
      }}
      disabled={disableDate}
      components={{
        // Day: (props) => <CustomDaycell {...props} />,
        DayButton: (props) => <MyCustomDayButton {...props} propertyData={propertyDataState} />,
      }}
    />
  );
};

export default CalendarComponent;
