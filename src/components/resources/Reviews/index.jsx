/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, ExportButton, List, SearchInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewsListDesktop from './ReviewsListDesktop';

const ReviewsListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const ReviewFilter = [<SearchInput source="q" alwaysOn />];

const ReviewsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const ReviewsList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'reviewSender', 'reviewReceiver', 'bookingId', 'propertyId', 'message', 'overallRating', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Id',
      reviewSender: 'Sender Name',
      reviewReceiver: 'Receiver Name',
      bookingId: 'Booking Id',
      propertyId: 'Property Id',
      message: 'Message',
      overallRating: 'Overall Rating',
      createdAt: 'Created At',
    },
    exportAll: true,
    flatten: {
      reviewSender: (value) => value?.name || '',
      reviewReceiver: (value) => value?.name || '',
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <List
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
        filters={ReviewFilter}
        actions={<ReviewsListActions />}
        title={<ReviewsTitle />}
        exporter={exporter}
      >
        <ReviewsListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: ReviewsList,
};
