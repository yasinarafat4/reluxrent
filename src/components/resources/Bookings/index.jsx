/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, ExportButton, FilterButton, List, SearchInput, SelectInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import BookingEdit from './BookingEdit';
import BookingListDesktop from './BookingListDesktop';
import BookingShow from './BookingShow';

const BookingListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const BookingFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="bookingStatus"
    choices={[
      { id: 'PENDING', name: 'PENDING' },
      { id: 'ACCEPTED', name: 'ACCEPTED' },
      { id: 'CONFIRMED', name: 'CONFIRMED' },
      { id: 'DECLINED', name: 'DECLINED' },
      { id: 'EXPIRED', name: 'EXPIRED' },
      { id: 'CANCELLED', name: 'CANCELLED' },
    ]}
    optionText={(choice) => (
      <>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 4,
            mr: 1,
            display: 'inline-block',
          }}
        />
        {choice.name}
      </>
    )}
  />,

  <SelectInput
    source="paymentStatus"
    choices={[
      { id: 'PENDING', name: 'PENDING' },
      { id: 'PAID', name: 'PAID' },
      { id: 'EXPIRED', name: 'EXPIRED' },
      { id: 'UNATTEMPTED', name: 'UNATTEMPTED' },
      { id: 'FAILED', name: 'FAILED' },
      { id: 'CANCELLED', name: 'CANCELLED' },
    ]}
    optionText={(choice) => (
      <>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 4,
            mr: 1,
            display: 'inline-block',
          }}
        />
        {choice.name}
      </>
    )}
  />,
];

const BookingTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const BookingList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: [
      'id',
      'propertyId',
      'host',
      'guest',
      'startDate',
      'endDate',
      'guests',
      'totalNight',
      'confirmationCode',
      'confirmedAt',
      'totalPrice',
      'cleaningCharge',
      'totalGuestFee',
      'totalHostFee',
      'totalDiscount',
      'grandTotal',
      'discountType',
      'bookingType',
      'bookingStatus',
      'paymentStatus',
      'payoutStatus',
      'createdAt',
    ],
    ignore: [],
    headers: {
      id: 'Booking Id',
      propertyId: 'Property Id',
      host: 'Host Name',
      guest: 'Guest Name',
      totalNight: 'Total Night',
      confirmationCode: 'Confirmation Code',
      confirmedAt: 'Booked At',
      totalPrice: 'Price',
      cleaningCharge: 'Cleaning Charge',
      totalGuestFee: 'Total Guest Fee',
      totalDiscount: 'Total Discount',
      grandTotal: 'Total Price',
      discountType: 'Discount Type',
      bookingStatus: 'Booking Status',
      paymentStatus: 'Payment Status',
      payoutStatus: 'Payout Status',
      createdAt: 'Created At',
    },
    format: {  totalPrice: '৳#,##0.00', cleaningCharge: '৳#,##0.00', totalGuestFee: '৳#,##0.00', totalHostFee: '৳#,##0.00', totalDiscount: '৳#,##0.00', grandTotal: '৳#,##0.00' },
    columnWidths: {
      totalPrice: 10,
    },
    exportAll: true,
    flatten: {
      host: (value) => value?.name || '', // relational object
      guest: (value) => value?.name || '', // relational object
      guests: (v) => {
        if (!v) return '';
        return `${v.adults || 0} adults, ${v.children || 0} children, ${v.infants || 0} infants`;
      },
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <List filters={BookingFilters} actions={<BookingListActions />}  title={<BookingTitle />} exporter={exporter}>
        <BookingListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: BookingList,
  edit: BookingEdit,
  show: BookingShow,
};
