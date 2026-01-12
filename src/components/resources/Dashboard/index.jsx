'use client';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import HideSourceOutlinedIcon from '@mui/icons-material/HideSourceOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NoBackpackIcon from '@mui/icons-material/NoBackpack';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StarsIcon from '@mui/icons-material/Stars';
import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { ListBase, Title, useDefaultTitle, WithListContext } from 'react-admin';
import CardWithIcon from './CardWithIcon';
import PreviousMonthChart from './PreviousMonthChart';
import PreviousYearChart from './PreviousYearChart';
import ThisMonthChart from './ThisMonthChart';
import ThisYearChart from './ThisYearChart';
import Welcome from './Welcome';

const DashboardTitle = () => {
  const title = useDefaultTitle();
  return (
    <>
      <title>{`Dashboard-${title}`}</title>
      <span>Dashboard</span>
    </>
  );
};

const Dashboard = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  return (
    <>
      <Title title={<DashboardTitle />} />
      {/* Welcome */}
      <Welcome />
      <Stack width={'100%'} gap={3} py={3}>
        {/* Counters */}
        <Box width={'100%'} display={'grid'} gridTemplateColumns={'repeat(2, 1fr)'} gap={2}>
          {/* Listings */}
          <Box width={'100%'}>
            <Typography fontSize={20} fontWeight={600} variant="body1" mb={1}>
              Listings
            </Typography>
            <Box display={'grid'} gridTemplateColumns={'repeat(2, 1fr)'} justifyContent={'center'} gap={2} alignItems={'center'}>
              <ListBase resource="properties" disableSyncWithLocation>
                <CardWithIcon to="/properties" icon={ListAltIcon} title={'Total Listings'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
              </ListBase>
              <ListBase resource="properties" filter={{ isApproved: true }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/properties?filter=${encodeURIComponent(JSON.stringify({ isApproved: true }))}`}
                  icon={CheckCircleOutlineIcon}
                  title={'Approved'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="properties" filter={{ isApproved: false }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/properties?filter=${encodeURIComponent(JSON.stringify({ isApproved: false }))}`}
                  icon={CancelOutlinedIcon}
                  title={'Not-approved'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="properties" filter={{ status: 'Listed' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/properties?filter=${encodeURIComponent(JSON.stringify({ status: 'Listed' }))}`}
                  icon={ChecklistRtlIcon}
                  title={'Listed'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="properties" filter={{ status: 'Unlisted' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/properties?filter=${encodeURIComponent(JSON.stringify({ status: 'Unlisted' }))}`}
                  icon={HideSourceOutlinedIcon}
                  title={'Unlisted'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
            </Box>
          </Box>
          {/* Bookings */}
          <Box width={'100%'}>
            <Typography fontSize={20} fontWeight={600} variant="body1" mb={1}>
              Bookings
            </Typography>
            <Box display={'grid'} gridTemplateColumns={'repeat(2, 1fr)'} justifyContent={'center'} gap={2} alignItems={'center'}>
              <ListBase resource="bookings" perPage={2} disableSyncWithLocation>
                <CardWithIcon to="/bookings" icon={BookmarkAddIcon} title={'Total Bookings'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
              </ListBase>
              <ListBase resource="bookings" filter={{ bookingStatus: 'PENDING' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/bookings?filter=${encodeURIComponent(JSON.stringify({ bookingStatus: 'PENDING' }))}`}
                  icon={PendingActionsIcon}
                  title={'Pending'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="bookings" filter={{ bookingStatus: 'ACCEPTED' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/bookings?filter=${encodeURIComponent(JSON.stringify({ bookingStatus: 'ACCEPTED' }))}`}
                  icon={BookmarkAddedIcon}
                  title={'Accepted'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="bookings" filter={{ bookingStatus: 'CONFIRMED' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/bookings?filter=${encodeURIComponent(JSON.stringify({ bookingStatus: 'CONFIRMED' }))}`}
                  icon={BeenhereIcon}
                  title={'Confirmed'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="bookings" filter={{ bookingStatus: 'DECLINED' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/bookings?filter=${encodeURIComponent(JSON.stringify({ bookingStatus: 'DECLINED' }))}`}
                  icon={NoBackpackIcon}
                  title={'Declined'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
              <ListBase resource="bookings" filter={{ bookingStatus: 'CANCELLED' }} disableSyncWithLocation>
                <CardWithIcon
                  to={`/bookings?filter=${encodeURIComponent(JSON.stringify({ bookingStatus: 'CANCELLED' }))}`}
                  icon={BookmarkRemoveIcon}
                  title={'Cancelled'}
                  subtitle={<WithListContext render={({ total }) => <>{total}</>} />}
                />
              </ListBase>
            </Box>
          </Box>
        </Box>
        {/* Others */}
        <Box width={'100%'}>
          <Typography fontSize={20} fontWeight={600} variant="body1" mb={1}>
            Others
          </Typography>
          <Box display={'grid'} gridTemplateColumns={'repeat(4, 1fr)'} justifyContent={'center'} gap={2} alignItems={'center'}>
            {/* Users */}
            <ListBase resource="users" perPage={2} disableSyncWithLocation>
              <CardWithIcon to="/users" icon={PeopleAltIcon} title={'Total Users'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
            </ListBase>
            {/* Reviews */}
            <ListBase resource="reviews" perPage={2} disableSyncWithLocation>
              <CardWithIcon to="/reviews" icon={StarsIcon} title={'Total Reviews'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
            </ListBase>
          </Box>
        </Box>

        <Box width={'100%'}>
          {/* Revenue History Charts */}
          <Typography fontSize={20} fontWeight={600} variant="body1" mb={1}>
            Revenue History
          </Typography>
          <Box width={'100%'} display={'grid'} gridTemplateColumns={'repeat(2, 1fr)'} gap={2}>
            <PreviousMonthChart orders={[]} />
            <ThisMonthChart orders={[]} />
            <PreviousYearChart orders={[]} />
            <ThisYearChart orders={[]} />
          </Box>
        </Box>
      </Stack>

      {/* 

      <Divider sx={{ my: 10 }} />



      <Stack direction={'row'}>
        <NewCustomers />
      </Stack> */}

      {/* ----------------------- */}
      {/* <div style={styles.flex}>
        <div style={styles.leftCol}>
          <Stack style={styles.flex}>
            <CardWithIcon to="/" icon={DollarIcon} title={'Monthly Revenue'} subtitle={100} />
            <Spacer />
            <ListBase resource="bookings" disableSyncWithLocation>
              <CardWithIcon to="/" icon={ShoppingCartIcon} title={'New Orders'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
            </ListBase>
            <ListBase resource="bookings" disableSyncWithLocation>
              <CardWithIcon to="/" icon={ShoppingCartIcon} title={'New Orders'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
            </ListBase>
            <ListBase resource="bookings" disableSyncWithLocation>
              <CardWithIcon to="/" icon={ShoppingCartIcon} title={'New Orders'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
            </ListBase>
            <ListBase resource="bookings" disableSyncWithLocation>
              <CardWithIcon to="/" icon={ShoppingCartIcon} title={'New Orders'} subtitle={<WithListContext render={({ total }) => <>{total}</>} />} />
            </ListBase>
          </Stack>
          <div style={styles.singleCol}>
            <OrderChart orders={[]} />
          </div>
          <div style={styles.singleCol}>
            <PendingOrders orders={[]} />
          </div>
        </div>
        <div style={styles.rightCol}>
          <div style={styles.flex}>
            <PendingReviews />
            <Spacer />
            <NewCustomers />
          </div>
        </div>
      </div> */}
    </>
  );
};

export default Dashboard;
