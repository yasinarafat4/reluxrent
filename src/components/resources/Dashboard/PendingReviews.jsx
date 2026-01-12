import CommentIcon from '@mui/icons-material/Comment';
import { Avatar, Box, Button, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { stringify } from 'query-string';
import { FunctionField, ReferenceField, useTranslate } from 'react-admin';
import { Link } from 'react-router-dom';
import CardWithIcon from './CardWithIcon';

const PendingReviews = () => {
  const translate = useTranslate();
  //   const {
  //     data: reviews,
  //     total,
  //     isPending,
  //   } = useGetList('reviews', {
  //     filter: { status: 'pending' },
  //     sort: { field: 'date', order: 'DESC' },
  //     pagination: { page: 1, perPage: 100 },
  //   });

  //   // Handle customer data loading state
  //   const isCustomerDataLoaded = useIsDataLoaded(['customers', 'getMany', { ids: [String(reviews?.[0]?.customer_id)] }], { enabled: !isPending && reviews && reviews.length > 0 });

  //   const display = isPending || !isCustomerDataLoaded ? 'none' : 'block';
  const display = 'block';
  const reviews = [];
  return (
    <CardWithIcon
      to={{
        pathname: '/',
        search: stringify({
          filter: JSON.stringify({ status: 'pending' }),
        }),
      }}
      icon={CommentIcon}
      title={translate('Pending Reviews')}
      subtitle={100}
    >
      <List sx={{ display }}>
        {reviews?.map((record) => (
          <ListItem key={record.id} disablePadding>
            <ListItemButton alignItems="flex-start" component={Link} to={`/reviews/${record.id}`}>
              <ListItemAvatar>
                <ReferenceField record={record} source="customer_id" reference="customers" link={false}>
                  <FunctionField render={(customer) => <Avatar src={`${customer.avatar}?size=32x32`} sx={{ bgcolor: 'background.paper' }} alt={`${customer.first_name} ${customer.last_name}`} />} />
                </ReferenceField>
              </ListItemAvatar>

              <ListItemText
                secondary={record.comment}
                sx={{
                  overflowY: 'hidden',
                  height: '4em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  paddingRight: 0,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }}>&nbsp;</Box>
      <Button sx={{ borderRadius: 0 }} component={Link} to="/" size="small" color="primary">
        <Box sx={{ p: 1, color: 'primary.main' }}>{translate('All Reviews')}</Box>
      </Button>
    </CardWithIcon>
  );
};

export default PendingReviews;
