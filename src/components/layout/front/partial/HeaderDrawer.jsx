import LightDarkSwitcher from '@/components/LightDarkSwitcher';
import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Drawer, ListItemIcon, Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bell, Globe, Heart, Lock, LogIn, LogOut, LucideMessageCircleQuestion, MessageSquareMore, NotepadText, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Avatar from 'react-avatar';
import 'react-day-picker/style.css';
import logo from '../../../../../public/images/logos/reluxrent.png';
import LargeSearchBox from './Header/LargeSearchBox';

const HeaderDrawer = ({ drawerOpen, toggleDrawer }) => {
  const { trans } = useTranslation();

  const { user, handleLogout } = useAuth();
  const router = useRouter();
  const { actions } = usePopups();

  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0, infants: 0 });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const updateGuest = (type, change) => {
    setGuestCount((prev) => {
      const updated = { ...prev, [type]: Math.max(0, prev[type] + change) };
      return updated;
    });
  };

  const open = Boolean(menuAnchorEl);
  const handleClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const [activeTab, setActiveTab] = useState('Homes');
  // Map tab keys to indices for MUI Tabs
  const tabIndexMap = { Homes: 0, Experiences: 1 };
  const indexTabMap = ['Homes', 'Experiences'];

  const handleTabChange = (event, newValue) => {
    setActiveTab(indexTabMap[newValue]);
  };

  return (
    <div>
      <Drawer
        slotProps={{
          paper: {
            sx: {
              overflowY: 'unset',
            },
          },
        }}
        anchor={'top'}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            px: { xs: 1.5, md: 3 },
            bgcolor: 'background.primary',
          }}
        >
          {/* Logo */}
          <Box display={'flex'} justifyContent={'start'}>
            <Link href="/" passHref>
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Image src={logo} alt="Logo" width={100} height={50} />
              </Box>
            </Link>
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              animation: 'slidedown 0.5s ease',
              gap: { md: 2, xl: 3 },
            }}
          >
            <Tabs
              value={tabIndexMap[activeTab]}
              onChange={handleTabChange}
              aria-label="large search box tabs"
              sx={{
                minHeight: 'auto',
                '& .MuiTabs-flexContainer': {
                  gap: { md: 2, xl: 3 },
                },
              }}
            >
              {[
                { icon: '🏠', name: 'Homes' },
                { icon: '🎈', name: 'Experiences' },
              ].map((tab, i) => (
                <Tab
                  key={i}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="animate-rotate-once" style={{ fontSize: '1.25rem' }}>
                        {tab.icon}
                      </span>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { md: '13px', xs: '15px' },
                          color: activeTab === tab.name ? 'primary.main' : 'text.secondary',
                          fontWeight: activeTab === tab.name ? 600 : 400,
                        }}
                      >
                        {trans(tab.name)}
                      </Typography>
                    </Box>
                  }
                  sx={{ minWidth: 'auto', minHeight: 'auto', padding: 0 }}
                  disableRipple
                />
              ))}
            </Tabs>
          </Box>

          {/* End Items (desktop only) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'end',
              alignItems: 'center',
            }}
          >
            {/* Switches */}
            {user?.isHost ? (
              <Link href="/host/today?type=today" passHref>
                <Typography
                  sx={{
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    fontSize: '15px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {trans('Switch to Hosting')}
                </Typography>
              </Link>
            ) : (
              <Typography
                sx={{
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  fontSize: '16px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                onClick={() => actions.openPopup('becomeHost', {})}
              >
                {trans('Become a Host')}
              </Typography>
            )}

            {/* Language and Currency */}
            <Tooltip title={trans('Language and Currency')}>
              <IconButton
                onClick={() => actions.openPopup('languageAndCurrency', 'language')}
                sx={{
                  borderRadius: '9999px',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Globe size={22} />
              </IconButton>
            </Tooltip>

            {/* Dark & Light Mode Icons */}
            <LightDarkSwitcher />

            {/* Profile */}
            <Tooltip title="Account settings">
              <IconButton onClick={handleClick} size="small">
                {user?.image ? (
                  <Box border={'1px solid'} borderColor={'divider'} borderRadius={'100%'}>
                    <Avatar src={user?.image} alt={user?.name} size="32" round={true} />
                  </Box>
                ) : (
                  <Avatar {...(user ? { name: user?.name } : { facebookId: '100008343750912' })} size="32" round={true} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          {/* Menu */}
          <Menu
            sx={{ '& .MuiPaper-root': { minWidth: 250 }, zIndex: '99999' }}
            disableScrollLock
            anchorEl={menuAnchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {user
              ? [
                  <Link href="/user/profile" passHref>
                    <MenuItem onClick={handleClose}>
                      {user?.image ? (
                        <Avatar className="mr-3" src={user?.image} alt={user?.name} size="25" round={true} />
                      ) : (
                        <Avatar className="mr-3" {...(user ? { name: user?.name } : { facebookId: '100008343750912' })} size="25" round={true} />
                      )}
                      {trans('Profile')}
                    </MenuItem>
                  </Link>,
                  <Divider />,
                  <MenuItem component={Link} selected={router.pathname == '/guest/wishlist'} href="/guest/wishlist">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <Heart size={18} />
                    </ListItemIcon>
                    {trans('Wishlists')}
                  </MenuItem>,
                  <MenuItem component={Link} selected={router.pathname == '/guest/messages'} href="/guest/messages">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <MessageSquareMore size={18} />
                    </ListItemIcon>
                    {trans('Messages')}
                  </MenuItem>,
                  <MenuItem component={Link} selected={router.pathname == '/guest/bookings'} href="/guest/bookings?type=home&status=All">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <NotepadText size={18} />
                    </ListItemIcon>
                    {trans('Bookings')}
                  </MenuItem>,
                  <Divider />,
                  <MenuItem component={Link} selected={router.pathname == '/guest/notifications'} href="/guest/notifications">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <Bell size={18} />
                    </ListItemIcon>
                    {trans('Notifications')}
                  </MenuItem>,
                  <MenuItem component={Link} selected={router.pathname == '/account-settings'} href="/account-settings">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <Settings size={18} />
                    </ListItemIcon>
                    {trans('Account Settings')}
                  </MenuItem>,
                  <MenuItem component={Link} selected={router.pathname == '/help'} href="/help">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <LucideMessageCircleQuestion size={18} />
                    </ListItemIcon>
                    {trans('Help')}
                  </MenuItem>,
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <LogOut size={18} />
                    </ListItemIcon>
                    {trans('Logout')}
                  </MenuItem>,
                ]
              : [
                  <MenuItem component={Link} selected={router.pathname == '/guest/wishlist'} href="/guest/wishlist">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <Lock size={18} />
                    </ListItemIcon>
                    <Typography>{trans('Privacy')}</Typography>
                  </MenuItem>,
                  <MenuItem component={Link} selected={router.pathname == '/guest/wishlist'} href="/guest/wishlist">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <LucideMessageCircleQuestion size={18} />
                    </ListItemIcon>
                    {trans('Help')}
                  </MenuItem>,
                  <MenuItem component={Link} selected={router.pathname == '/login'} href="/login">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <LogIn size={18} />
                    </ListItemIcon>
                    {trans('Login')}
                  </MenuItem>,
                ]}
          </Menu>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' }, cursor: 'pointer' }}>
          <Box
            sx={{
              width: '100%',
              bgcolor: 'background.primary',
            }}
          >
            <LargeSearchBox activeTab={activeTab} guestCount={guestCount} updateGuest={updateGuest} />
          </Box>
        </Box>
      </Drawer>
    </div>
  );
};

export default HeaderDrawer;
