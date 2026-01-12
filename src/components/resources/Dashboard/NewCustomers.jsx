import CustomerIcon from '@mui/icons-material/PersonAdd';
import { Avatar, Box, Button } from '@mui/material';
import { subDays } from 'date-fns';
import { ListBase, SimpleList, useTranslate, WithListContext } from 'react-admin';
import { Link } from 'react-router-dom';

import CardWithIcon from './CardWithIcon';

const NewCustomers = () => {
  const translate = useTranslate();

  const aMonthAgo = subDays(new Date(), 30);
  aMonthAgo.setDate(aMonthAgo.getDate() - 30);
  aMonthAgo.setHours(0);
  aMonthAgo.setMinutes(0);
  aMonthAgo.setSeconds(0);
  aMonthAgo.setMilliseconds(0);

  return (
    <ListBase resource="users" perPage={1} disableSyncWithLocation>
      <CardWithIcon to="/" icon={CustomerIcon} title={translate('New Customers')} subtitle={<WithListContext render={({ total }) => <>{total}</>} />}>
        <SimpleList primaryText="%{name}" leftAvatar={(customer) => <Avatar src={`${customer.name}?size=32x32`} alt={`${customer.name}`} />} />
        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          &nbsp;
        </Box>
        <Button sx={{ borderRadius: 0 }} component={Link} to="/customers" size="small" color="primary">
          <Box
            sx={{
              p: 1,
              color: 'primary.main',
            }}
          >
            {translate('All Customers')}
          </Box>
        </Button>
      </CardWithIcon>
    </ListBase>
  );
};

export default NewCustomers;
