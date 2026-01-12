import { blue, green, orange, red } from '@mui/material/colors';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the review status
  if (record.bookingStatus === 'ACCEPTED') {
    return {
      ...style,
      borderLeftColor: blue[600],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.bookingStatus === 'CONFIRMED') {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.bookingStatus === 'PENDING') {
    return {
      ...style,
      borderLeftColor: orange[600],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (['DECLINED', 'EXPIRED', 'CANCELLED'].includes(record.bookingStatus)) {
    return {
      ...style,
      borderLeftColor: red[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

export default rowSx;
