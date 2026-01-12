'use client';
import adminLogResource from '@/components/resources/AdminLogs';
import amenitiesResource from '@/components/resources/Amenities';
import amenitiesTypesResource from '@/components/resources/AmenitiesTypes';
import bedTypesResource from '@/components/resources/BedTypes';
import bookingsResource from '@/components/resources/Bookings';
import cancellationpolicyResource from '@/components/resources/Cancellationpolicy';
import citiesResource from '@/components/resources/Cities';
import contactResource from '@/components/resources/contacts';
import countriesResource from '@/components/resources/Countries';
import currenciesResource from '@/components/resources/Currencies';
import Dashboard from '@/components/resources/Dashboard/index.jsx';
import faqResource from '@/components/resources/faqs';
import feesResource from '@/components/resources/Fees';
import helpsResource from '@/components/resources/Help';
import helpCategoryResource from '@/components/resources/HelpCategory';
import languageResource from '@/components/resources/languages';
import CustomLayout from '@/components/resources/Layout/CustomLayout';
import logResource from '@/components/resources/Logs';
import Messages from '@/components/resources/Messages';
import pageResource from '@/components/resources/pages';
import paymentResource from '@/components/resources/Payments';
import payoutMethodResource from '@/components/resources/PayoutMethods';
import payoutResource from '@/components/resources/Payouts';
import permissionsResource from '@/components/resources/Permissions';
import Profile from '@/components/resources/Profile';
import propertiesResource from '@/components/resources/Properties';
import propertyTypesResource from '@/components/resources/PropertyTypes';
import reviewResource from '@/components/resources/Reviews';
import rolesResource from '@/components/resources/Roles';
import spaceTypesResource from '@/components/resources/SpaceTypes';
import stafsResource from '@/components/resources/Stafs';
import statesResource from '@/components/resources/States';
import translationResource from '@/components/resources/translations';
import usersResource from '@/components/resources/Users';
import walletResource from '@/components/resources/Wallets';
import authProvider from '@/lib/authProvider';
import { dataProvider } from '@/lib/dataProvider';
import { Admin, Authenticated, CustomRoutes, radiantDarkTheme, radiantLightTheme, Resource } from 'react-admin';
import { Route } from 'react-router';

const AdminPanel = () => {
  return (
    <Admin title="Reluxrent Admin" authProvider={authProvider} dashboard={Dashboard} dataProvider={dataProvider} layout={CustomLayout} theme={radiantLightTheme} darkTheme={radiantDarkTheme}>
      <Resource name="users" {...usersResource} />
      <Resource name="stafs" {...stafsResource} />
      <Resource name="roles" {...rolesResource} />
      <Resource name="permissions" {...permissionsResource} />
      <Resource name="logs" {...logResource} />
      <Resource name="admin-logs" {...adminLogResource} />
      <Resource name="wallets" {...walletResource} />
      <Resource name="payouts" {...payoutResource} />
      <Resource name="payout-methods" {...payoutMethodResource} />
      <Resource name="payments" {...paymentResource} />

      <Resource name="bookings" {...bookingsResource} />
      <Resource name="properties" {...propertiesResource} />

      <Resource name="property-types" {...propertyTypesResource} />
      <Resource name="space-types" {...spaceTypesResource} />
      <Resource name="bed-types" {...bedTypesResource} />

      <Resource name="amenity-types" {...amenitiesTypesResource} />
      <Resource name="amenities" {...amenitiesResource} />

      <CustomRoutes>
        <Route
          path="/messages"
          element={
            <Authenticated>
              <Messages />
            </Authenticated>
          }
        />
        <Route
          path="/profile"
          element={
            <Authenticated>
              <Profile />
            </Authenticated>
          }
        />
      </CustomRoutes>

      <Resource name="pages" {...pageResource} />
      <Resource name="faqs" {...faqResource} />
      <Resource name="help-categories" {...helpCategoryResource} />
      <Resource name="helps" {...helpsResource} />
      <Resource name="contacts" {...contactResource} />
      <Resource name="reviews" {...reviewResource} />
      <Resource name="fees" {...feesResource} />
      <Resource name="cancellation-policy" {...cancellationpolicyResource} />
      <Resource name="email-settings" {...countriesResource} />
      <Resource name="email-templates" {...countriesResource} />
      <Resource name="sms-settings" {...countriesResource} />
      <Resource name="sms-templates" {...countriesResource} />
      <Resource name="countries" {...countriesResource} />
      <Resource name="states" {...statesResource} />
      <Resource name="cities" {...citiesResource} />
      <Resource name="currencies" {...currenciesResource} />
      <Resource name="languages" {...languageResource} />
      <Resource name="translations" {...translationResource} />
    </Admin>
  );
};

export default AdminPanel;
