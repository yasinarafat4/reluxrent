import { Card, CardHeader, List } from '@mui/material';
import { useTranslate } from 'react-admin';
import PendingOrder from './PendingOrder';

const PendingOrders = ({ orders = [] }) => {
  const translate = useTranslate();

  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader title={translate('Pending Orders')} />
      <List dense={true}>
        {orders.map((record) => (
          <PendingOrder key={record.id} order={record} />
        ))}
      </List>
    </Card>
  );
};

export default PendingOrders;
