import { green, red } from '@mui/material/colors';

const rowSx = (selectedRow) => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Check if this row is selected
  if (selectedRow && selectedRow === record.id) {
    style = {
      ...style,
      backgroundColor: 'action.selected',
    };
  }

  // Apply border styles based on the review status
  if (record.isVerified) {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (!record.isVerified) {
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
