import { ArrowBigLeft } from 'lucide-react';
import { EditButton, ListButton, ResourceContextProvider, Show, TabbedShowLayout, TopToolbar } from 'react-admin';
import Documents from './Documents';
import UserBookings from './UserBookings';
import UserInformation from './UserInformation';
import UserListing from './UserListing';
import UserLogs from './UserLogs';
import UserPayments from './UserPayments';
import UserPayoutMethods from './UserPayoutMethods';
import UserPayouts from './UserPayouts';
import UserReservation from './UserReservation';
import UserReviewsBy from './UserReviewsBy';
import UserReviewsTo from './UserReviewsTo';

const UserShowActions = () => (
  <TopToolbar>
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
    <EditButton />
  </TopToolbar>
);

// const UserTitle = () => {
//   const title = useDefaultTitle();
//   const { defaultTitle } = useListContext();
//   console.log('defaultTitle', defaultTitle);
//   return (
//     <>
//       <title>{`${defaultTitle}-${title}`}</title>
//       <span>{defaultTitle}</span>
//     </>
//   );
// };

const UserShow = () => {
  return (
    <Show actions={<UserShowActions />}>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="User Information">
          <UserInformation />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Documents" path="documents">
          <Documents />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Listing" path="listings">
          <UserListing />
        </TabbedShowLayout.Tab>

        {/* <TabbedShowLayout.Tab label="Reservations" path="reservations">
            <UserReservation />
        </TabbedShowLayout.Tab> */}
        <TabbedShowLayout.Tab label="Reservations" path="reservations">
          <ResourceContextProvider value="bookings">
            <UserReservation />
          </ResourceContextProvider>
        </TabbedShowLayout.Tab>

        {/* <TabbedShowLayout.Tab label="Bookings" path="bookings">
            <UserBookings />
        </TabbedShowLayout.Tab> */}
        <TabbedShowLayout.Tab label="Bookings" path="bookings">
          <ResourceContextProvider value="bookings">
            <UserBookings />
          </ResourceContextProvider>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Reviews By" path="reviews-by">
          <UserReviewsBy />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Reviews To" path="reviews-to">
          <UserReviewsTo />
        </TabbedShowLayout.Tab>

        {/* <TabbedShowLayout.Tab label="Payouts" path="payouts">
          <UserPayouts />
        </TabbedShowLayout.Tab> */}
        <TabbedShowLayout.Tab label="Payouts" path="payouts">
          <ResourceContextProvider value="payouts">
            <UserPayouts />
          </ResourceContextProvider>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Payout Methods" path="payout-methods">
          <ResourceContextProvider value="payout-methods">
            <UserPayoutMethods />
          </ResourceContextProvider>
        </TabbedShowLayout.Tab>

        {/* <TabbedShowLayout.Tab label="Payments" path="payments">
          <UserPayments />
        </TabbedShowLayout.Tab> */}
        <TabbedShowLayout.Tab label="Payments" path="payments">
          <ResourceContextProvider value="payments">
            <UserPayments />
          </ResourceContextProvider>
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Wallet" path="wallet">
          Wallet
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Logs" path="log">
          <UserLogs />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default UserShow;
