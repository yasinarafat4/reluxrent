import { Avatar, Box, ListItem, ListItemAvatar, ListItemButton, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { useReference, useTranslate } from 'react-admin';
import { Link } from 'react-router';

const PendingOrder = ({ order }) => {
  const translate = useTranslate();
  const { referenceRecord: customer, isPending } = useReference({
    reference: 'customers',
    id: order.customer_id,
  });

  return (
    <ListItem disablePadding>
      <ListItemButton component={Link} to={`/orders/${order.id}`}>
        <ListItemAvatar>
          {isPending ? <Avatar /> : <Avatar src={`${customer?.avatar}?size=32x32`} sx={{ bgcolor: 'background.paper' }} alt={`${customer?.first_name} ${customer?.last_name}`} />}
        </ListItemAvatar>
        <ListItemText
          primary={new Date(order.date).toLocaleString('en-GB')}
          secondary={translate('pos.dashboard.order.items', {
            smart_count: order.basket.length,
            nb_items: order.basket.length,
            customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
          })}
        />
        <ListItemSecondaryAction>
          <Box
            component="span"
            sx={{
              marginRight: '1em',
              color: 'text.primary',
            }}
          >
            {order.total}$
          </Box>
        </ListItemSecondaryAction>
      </ListItemButton>
    </ListItem>
  );
};

export default PendingOrder;
