import { Box, Grid, Paper, Tab, Tabs } from '@mui/material';
import { ArrowBigLeft } from 'lucide-react';
import { useState } from 'react';
import { CloneButton, EditBase, ListButton, TopToolbar, useDefaultTitle, useEditContext } from 'react-admin';
import ActionsTab from './ActionsTab';
import AmenitiesTab from './AmenitiesTab';
import BasicTab from './BasicTab';
import BookingTab from './BookingTab';
import CalendarTab from './CalendarTab';
import DescriptionTab from './DescriptionTab';
import DetailsTab from './DetailsTab';
import LocationTab from './LocationTab';
import PhotosTab from './PhotosTab';
import PricingTab from './PricingTab';
import TermsAndRulesTab from './TermsAndRulesTab';

const PropertyEditTitle = () => {
  const appTitle = useDefaultTitle();
  const { defaultTitle } = useEditContext();
  return <title>{`${defaultTitle}-${appTitle}`}</title>;
};

const PropertyEditActions = () => (
  <TopToolbar>
    <CloneButton />
    <ListButton label="Back" icon={<ArrowBigLeft size={20} />} />
  </TopToolbar>
);

const PropertyEdit = () => {
  const [tab, setTab] = useState(0);
  const handleChange = (event, newValue) => setTab(newValue);
  return (
    <EditBase>
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          padding: 2,
          margin: 0,
        }}
      >
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, md: 2 }}>
            <Paper elevation={1}>
              <Tabs orientation="vertical" variant="scrollable" value={tab} onChange={handleChange} sx={{ borderRight: 2, borderColor: 'divider' }}>
                <Tab label="Basics" />
                <Tab label="Description" />
                <Tab label="Details" />
                <Tab label="Location" />
                <Tab label="Amenities" />
                <Tab label="Photos" />
                <Tab label="Pricing" />
                <Tab label="Property Rules" />
                <Tab label="Booking" />
                <Tab label="Calendar" />
                <Tab label="Actions" />
              </Tabs>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 10 }}>
            <Paper elevation={2} sx={{ p: 2 }}>
              {tab === 0 && <BasicTab />}
              {tab === 1 && <DescriptionTab />}
              {tab === 2 && <DetailsTab />}
              {tab === 3 && <LocationTab />}
              {tab === 4 && <AmenitiesTab />}
              {tab === 5 && <PhotosTab />}
              {tab === 6 && <PricingTab />}
              {tab === 7 && <TermsAndRulesTab />}
              {tab === 8 && <BookingTab />}
              {tab === 9 && <CalendarTab />}
              {tab === 10 && <ActionsTab />}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </EditBase>
  );
};

export default PropertyEdit;
