import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BedIcon from '@mui/icons-material/Bed';
import CategoryIcon from '@mui/icons-material/Category';
import ChaletIcon from '@mui/icons-material/Chalet';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import EngineeringIcon from '@mui/icons-material/Engineering';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LanguageIcon from '@mui/icons-material/Language';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PagesIcon from '@mui/icons-material/Pages';
import PeopleIcon from '@mui/icons-material/People';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import PublicIcon from '@mui/icons-material/Public';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import TextsmsIcon from '@mui/icons-material/Textsms';
import TranslateIcon from '@mui/icons-material/Translate';
import TuneIcon from '@mui/icons-material/Tune';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DashboardMenuItem, MenuItemLink, usePermissions, useSidebarState } from 'react-admin';
const Menu = ({ dense = false }) => {
  const { permissions } = usePermissions();
  const [menuOpen, setMenuOpen] = useState({});

  const handleMenuToggle = (menu) => {
    setMenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const [open] = useSidebarState();

  const menuIconSx = {
    '& .MuiListItemIcon-root': { minWidth: '36px' },
  };

  const can = (resource, action = 'list') => permissions?.some((p) => (p.resource == resource || p.resource == '*') && (p.action == action || p.action == '*'));

  return (
    <Box
      sx={{
        width: open ? 260 : 50,
        marginTop: 1,

        marginBottom: 10,
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
      className={clsx({
        'RaMenu-open': open,
        'RaMenu-closed': !open,
      })}
    >
      <DashboardMenuItem sx={menuIconSx} />
      {/* User Management */}
      {can('manage_user', 'list') && [
        <ListItemButton key={'manage_user'} sx={{ py: 0.5 }} onClick={() => handleMenuToggle('menuUsersManagement')}>
          <ListItemIcon sx={{ minWidth: '35px' }}>
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText primary="User Management" />
          {menuOpen['menuUsersManagement'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>,

        <Collapse key={'menuUsersManagement'} in={menuOpen['menuUsersManagement']}>
          <List sx={{ ml: 0.5 }} component={'div'} disablePadding>
            {can('users', 'list') && <MenuItemLink to="/users" state={{ _scrollToTop: true }} primaryText={'Users'} leftIcon={<PeopleIcon />} dense={dense} sx={menuIconSx} />}
            {can('stafs', 'list') && <MenuItemLink to="/stafs" state={{ _scrollToTop: true }} primaryText={'Stafs'} leftIcon={<SupervisorAccountIcon />} dense={dense} sx={menuIconSx} />}
            {can('roles', 'list') && <MenuItemLink to="/roles" state={{ _scrollToTop: true }} primaryText={'Roles'} leftIcon={<AdminPanelSettingsIcon />} dense={dense} sx={menuIconSx} />}
            {can('permissions', 'list') && <MenuItemLink to="/permissions" state={{ _scrollToTop: true }} primaryText={'Permissions'} leftIcon={<LockPersonIcon />} dense={dense} sx={menuIconSx} />}
            {can('logs', 'list') && <MenuItemLink to="/admin-logs" state={{ _scrollToTop: true }} primaryText={'Staf Activity Logs'} leftIcon={<HowToRegIcon />} dense={dense} sx={menuIconSx} />}
          </List>
        </Collapse>,
      ]}

      {/* Manage Bookings */}
      {can('bookings', 'list') && <MenuItemLink to="/bookings" state={{ _scrollToTop: true }} primaryText={'Manage Bookings'} leftIcon={<EventAvailableIcon />} dense={dense} sx={menuIconSx} />}

      {/* Payments */}
      {can('payments', 'list') && <MenuItemLink to="/payments" state={{ _scrollToTop: true }} primaryText={'Payments'} leftIcon={<CreditScoreOutlinedIcon />} dense={dense} sx={menuIconSx} />}

      {/* Payout */}
      {can('payouts', 'list') && <MenuItemLink to="/payouts" state={{ _scrollToTop: true }} primaryText={'Payouts'} leftIcon={<AccountBalanceWalletIcon  />} dense={dense} sx={menuIconSx} />}

      {/* Manage Property */}
      {can('properties', 'list') && <MenuItemLink to="/properties" state={{ _scrollToTop: true }} primaryText={'Manage Property'} leftIcon={<HomeWorkIcon />} dense={dense} sx={menuIconSx} />}

      {/* Manage Messages */}
      {can('messages', 'list') && <MenuItemLink to="/messages" state={{ _scrollToTop: true }} primaryText={'Messages'} leftIcon={<TextsmsIcon />} dense={dense} sx={menuIconSx} />}

      {/* Property Settings */}
      {can('manage_property_settings', 'list') && [
        <ListItemButton key={'manage_property_settings'} sx={{ py: 0.5 }} onClick={() => handleMenuToggle('menuPropertySettings')}>
          <ListItemIcon sx={{ minWidth: '35px' }}>
            <TuneIcon />
          </ListItemIcon>
          <ListItemText primary="Property Settings" />
          {menuOpen['menuPropertySettings'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>,
        <Collapse key={'menuPropertySettings'} in={menuOpen['menuPropertySettings']}>
          <List sx={{ ml: 0.5 }} component={'div'} disablePadding>
            <MenuItemLink to="/property-types" state={{ _scrollToTop: true }} primaryText={'Property Type'} leftIcon={<HolidayVillageIcon />} dense={dense} sx={menuIconSx} />
            <MenuItemLink to="/space-types" state={{ _scrollToTop: true }} primaryText={'Space Type'} leftIcon={<ChecklistRtlIcon />} dense={dense} sx={menuIconSx} />
            <MenuItemLink to="/bed-types" state={{ _scrollToTop: true }} primaryText={'Bed Type'} leftIcon={<BedIcon />} dense={dense} sx={menuIconSx} />
          </List>
        </Collapse>,
      ]}

      {/* Experience */}
      {can('experience', 'list') && <MenuItemLink to="/experience" state={{ _scrollToTop: true }} primaryText={'Manage Experience'} leftIcon={<VerticalSplitIcon />} dense={dense} sx={menuIconSx} />}

      {/* Experience Settings */}
      {can('manage_experience_settings', 'list') && [
        <ListItemButton key={'manage_experience_settings'} sx={{ py: 0.5 }} onClick={() => handleMenuToggle('menuExperienceSettings')}>
          <ListItemIcon sx={{ minWidth: '35px' }}>
            <EngineeringIcon />
          </ListItemIcon>
          <ListItemText primary="Experience Settings" />
          {menuOpen['menuExperienceSettings'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>,
        <Collapse key={'menuExperienceSettings'} in={menuOpen['menuExperienceSettings']}>
          <List sx={{ ml: 0.5 }} component={'div'} disablePadding>
            {can('experience-categories', 'list') && (
              <MenuItemLink to="/experience-categories" state={{ _scrollToTop: true }} primaryText={'Experience Category'} leftIcon={<CategoryIcon />} dense={dense} sx={menuIconSx} />
            )}
            {can('inclusions', 'list') && <MenuItemLink to="/inclusions" state={{ _scrollToTop: true }} primaryText={'Inclusion'} leftIcon={<PlaylistAddIcon />} dense={dense} sx={menuIconSx} />}
            {can('exclusions', 'list') && <MenuItemLink to="/exclusions" state={{ _scrollToTop: true }} primaryText={'Exclusion'} leftIcon={<PlaylistRemoveIcon />} dense={dense} sx={menuIconSx} />}
          </List>
        </Collapse>,
      ]}

      {/* Amenities Settings */}
      {can('manage_amenities_settings', 'list') && [
        <ListItemButton key={'manage_amenities_settings'} sx={{ py: 0.5 }} onClick={() => handleMenuToggle('menuAmenitiesSettings')}>
          <ListItemIcon sx={{ minWidth: '35px' }}>
            <ChaletIcon />
          </ListItemIcon>
          <ListItemText primary="Amenities Settings" />
          {menuOpen['menuAmenitiesSettings'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>,
        <Collapse key={'menuAmenitiesSettings'} in={menuOpen['menuAmenitiesSettings']}>
          <List sx={{ ml: 0.5 }} component={'div'} disablePadding>
            {can('amenities', 'list') && <MenuItemLink to="/amenities" state={{ _scrollToTop: true }} primaryText={'Amenities'} leftIcon={<SettingsRemoteIcon />} dense={dense} sx={menuIconSx} />}
            {can('amenity-types', 'list') && (
              <MenuItemLink to="/amenity-types" state={{ _scrollToTop: true }} primaryText={'Amenity Type'} leftIcon={<SettingsInputComponentIcon />} dense={dense} sx={menuIconSx} />
            )}
          </List>
        </Collapse>,
      ]}

      {/* Reviews */}
      {can('reviews', 'list') && <MenuItemLink to="/reviews" state={{ _scrollToTop: true }} primaryText={'Reviews'} leftIcon={<LocalActivityIcon />} dense={dense} sx={menuIconSx} />}

      {/* Manage Articles */}
      {can('manage_articles', 'list') && [
        <ListItemButton key={'manage_articles'} sx={{ py: 0.5 }} onClick={() => handleMenuToggle('menuArticles')}>
          <ListItemIcon sx={{ minWidth: '35px' }}>
            <ArticleIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Articles" />
          {menuOpen['menuArticles'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>,
        <Collapse key={'menuArticles'} in={menuOpen['menuArticles']}>
          <List sx={{ ml: 0.5 }} component={'div'} disablePadding>
            {can('help-categories', 'list') && <MenuItemLink to="/help-categories" state={{ _scrollToTop: true }} primaryText={'Categories'} leftIcon={<PagesIcon />} dense={dense} sx={menuIconSx} />}
            {can('helps', 'list') && <MenuItemLink to="/helps" state={{ _scrollToTop: true }} primaryText={'Articles'} leftIcon={<AssignmentIcon />} dense={dense} sx={menuIconSx} />}
          </List>
        </Collapse>,
      ]}

      {/* Manage Settings */}
      {can('manage_settings', 'list') && [
        <ListItemButton key={'manage_settings'} sx={{ py: 0.5 }} onClick={() => handleMenuToggle('menuSettings')}>
          <ListItemIcon sx={{ minWidth: '35px' }}>
            <SettingsSuggestIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Settings" />
          {menuOpen['menuSettings'] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>,
        <Collapse key={'menuSettings'} in={menuOpen['menuSettings']}>
          <List sx={{ ml: 0.5 }} component={'div'} disablePadding>
            {can('cancellation-policy', 'list') && (
              <MenuItemLink to="/cancellation-policy" state={{ _scrollToTop: true }} primaryText={'Cancellation Policy'} leftIcon={<EventBusyIcon />} dense={dense} sx={menuIconSx} />
            )}
            {can('fees', 'list') && <MenuItemLink to="/fees" state={{ _scrollToTop: true }} primaryText={'Fees & Tax'} leftIcon={<LocalAtmIcon />} dense={dense} sx={menuIconSx} />}
            {can('countries', 'list') && <MenuItemLink to="/countries" state={{ _scrollToTop: true }} primaryText={'Countries'} leftIcon={<PublicIcon />} dense={dense} sx={menuIconSx} />}
            {can('states', 'list') && <MenuItemLink to="/states" state={{ _scrollToTop: true }} primaryText={'States'} leftIcon={<PublicIcon />} dense={dense} sx={menuIconSx} />}
            {can('cities', 'list') && <MenuItemLink to="/cities" state={{ _scrollToTop: true }} primaryText={'Cities'} leftIcon={<PublicIcon />} dense={dense} sx={menuIconSx} />}
            {can('currencies', 'list') && <MenuItemLink to="/currencies" state={{ _scrollToTop: true }} primaryText={'Currency'} leftIcon={<MonetizationOnIcon />} dense={dense} sx={menuIconSx} />}

            {can('languages', 'list') && <MenuItemLink to="/languages" state={{ _scrollToTop: true }} primaryText={'Languages'} leftIcon={<LanguageIcon />} dense={dense} sx={menuIconSx} />}
            {can('translations', 'list') && <MenuItemLink to="/translations" state={{ _scrollToTop: true }} primaryText={'Translations'} leftIcon={<TranslateIcon />} dense={dense} sx={menuIconSx} />}
          </List>
        </Collapse>,
      ]}
    </Box>
  );
};

export default Menu;
