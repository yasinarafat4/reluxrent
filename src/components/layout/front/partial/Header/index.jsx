'use client';
import LightDarkSwitcher from '@/components/LightDarkSwitcher';
import { useAuth } from '@/contexts/authContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import { AppBar, Badge, Container, ListItemIcon, Stack, Tab, Tabs, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bell, Globe, Heart, Lock, LogIn, LogOut, LucideMessageCircleQuestion, MenuIcon, MessageSquareMore, NotepadText, Search, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Avatar from 'react-avatar';
import 'react-day-picker/style.css';
import logo from '../../../../../../public/images/logos/reluxrent.png';
import HeaderDrawer from '../HeaderDrawer';
import LargeSearchBox from './LargeSearchBox';
import SmallDeviceSearchBox from './SmallDeviceSearchBox';
import SmallSearchBox from './SmallSearchBox';

export default function Header() {
  const smDevice = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { trans } = useTranslation();
  const { user, unreadNotifications, handleLogout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const { actions } = usePopups();

  const [showLargeDeviceSearch, setShowLargeDeviceSearch] = useState(router.pathname !== '/' ? false : true);
  const [showSmallDeviceSearch, setShowSmallDeviceSearch] = useState(false);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [showLargeDeviceGuestPopup, setShowLargeDeviceGuestPopup] = useState(false);
  const [showSmallDeviceGuestPopup, setShowSmallDeviceGuestPopup] = useState(false);
  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0, infants: 0 });
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const smallDeviceFlatpickrRef = useRef(null);
  const largeDeviceGuestRef = useRef(null);
  const smallDeviceGuestRef = useRef(null);

  // Guest Modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (largeDeviceGuestRef.current && !largeDeviceGuestRef.current.contains(event.target)) {
        setShowLargeDeviceGuestPopup(false);
      }
      if (smallDeviceGuestRef.current && !smallDeviceGuestRef.current.contains(event.target)) {
        setShowSmallDeviceGuestPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateGuest = (type, change) => {
    setGuestCount((prev) => {
      const updated = { ...prev, [type]: Math.max(0, prev[type] + change) };
      return updated;
    });
  };

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Smooth scroll handler
  useEffect(() => {
    if (router.pathname !== '/') return;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentPosition = window.scrollY;
          setScrollPosition(currentPosition);

          // Automatic behavior only when not manually toggled
          if (!isManualToggle) {
            if (currentPosition > 160 && showLargeDeviceSearch) {
              setShowLargeDeviceSearch(false);
            } else if (currentPosition <= 160 && !showLargeDeviceSearch) {
              setShowLargeDeviceSearch(true);
            }
          }

          // Reset manual toggle when scrolled near top
          if (currentPosition < 100) {
            setIsManualToggle(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showLargeDeviceSearch, isManualToggle, router.pathname]);

  const [activeTab, setActiveTab] = useState('Homes');
  // Map tab keys to indices for MUI Tabs
  const tabIndexMap = { Homes: 0, Experiences: 1 };
  const indexTabMap = ['Homes', 'Experiences'];

  const handleTabChange = (event, newValue) => {
    setActiveTab(indexTabMap[newValue]);
  };

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  return (
    <AppBar
      sx={{
        bgcolor: 'background.primary',
        color: 'text.primary',
        transition: 'all 0.3s ease-in-out',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 0,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'repeat(3, 1fr)',
          height: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1,
          px: { xs: 1.5, sm: 3, xl: 0 },
        }}
      >
        {/* Logo */}
        <Box width={'100%'} display={'flex'} justifyContent={'start'}>
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
        {/* Large Device Search Boxes */}
        <Box display={{ xs: 'none', md: 'flex' }} justifyContent={'center'}>
          {!showLargeDeviceSearch ? (
            <SmallSearchBox setShowLargeDeviceSearch={setShowLargeDeviceSearch} setIsManualToggle={setIsManualToggle} guestCount={guestCount} toggleDrawer={toggleDrawer} />
          ) : (
            // Tabs
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
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
          )}
        </Box>
        {/* End Items (desktop only) */}
        <Box display={{ xs: 'none', md: 'flex' }} justifyContent={'end'} alignItems={'center'} textAlign={'center'} gap={1}>
          {/* Switches */}
          {user?.isHost ? (
            <Link href="/host/today?type=today" passHref>
              <Typography
                sx={{
                  fontWeight: 500,
                  p: 1,
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
                p: 1,
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
              <Globe size={20} />
            </IconButton>
          </Tooltip>

          {/* Dark & Light Mode Icons */}
          <LightDarkSwitcher />

          {/* Profile */}
          {user && (
            <Link href="/user/profile">
              <IconButton size="small">
                <Avatar src={user?.image} alt={user?.name} size="28" round={true} />
              </IconButton>
            </Link>
          )}

          {/* Menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuClick}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
              size="small"
            >
              <MenuIcon size={22} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ '& .MuiPaper-root': { minWidth: 250 }, zIndex: '99999' }}
            disableScrollLock
            anchorEl={menuAnchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {user
              ? [
                  <Link href="/user/profile" passHref>
                    <MenuItem onClick={handleMenuClose}>
                      {user?.image ? (
                        <Box mr={1} border={'1px solid'} borderColor={'divider'} width={25} height={25} borderRadius={'100%'}>
                          <Avatar src={user?.image} alt={user?.name} size="25" round={true} />
                        </Box>
                      ) : (
                        <Box mr={1}>
                          <Avatar {...(user?.user ? { name: user?.name } : { facebookId: '100008343750912' })} size="25" round={true} />
                        </Box>
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
                  <MenuItem component={Link} selected={router.pathname == '/user/reviews'} href="/user/reviews">
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <ReviewsOutlinedIcon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    {trans('Reviews')}
                  </MenuItem>,
                  <Divider />,
                  <MenuItem component={Link} selected={router.pathname == '/guest/notifications'} href="/guest/notifications">
                    <ListItemIcon sx={{ color: 'text.primary', position: 'relative' }}>
                      <Badge
                        badgeContent={unreadCount > 0 ? unreadCount : null}
                        color="error"
                        overlap="circular"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            minWidth: 16,
                            height: 16,
                            right: -4,
                            top: 2,
                          },
                        }}
                      >
                        <Bell size={18} />
                      </Badge>
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
      </Container>

      <Box sx={{ display: { xs: 'none', md: 'block' }, cursor: 'pointer' }}>
        {showLargeDeviceSearch && (
          <Box
            sx={{
              width: '100%',
              display: { xs: 'none', md: 'block' },
              animation: 'fadeIn 0.5s ease-out forwards',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}
          >
            <LargeSearchBox
              activeTab={activeTab}
              dates={dates}
              guestCount={guestCount}
              updateGuest={updateGuest}
              largeDeviceGuestRef={largeDeviceGuestRef}
              showLargeDeviceGuestPopup={showLargeDeviceGuestPopup}
              setShowLargeDeviceGuestPopup={setShowLargeDeviceGuestPopup}
            />
          </Box>
        )}
      </Box>

      {/* Small Device Search */}
      {!showSmallDeviceSearch && (
        <Stack py={1} px={1.5} display={{ md: 'none' }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          {/* Logo */}
          <Box display={'flex'} justifyContent={'start'}>
            <Link href="/" passHref>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Image src={logo} alt="Logo" width={100} height={50} />
              </Box>
            </Link>
          </Box>

          <Stack direction={'row'} gap={1} alignItems={'center'}>
            {/* Search Icon */}
            <Box
              onClick={() => {
                setShowSmallDeviceSearch((prev) => !prev);
                setIsManualToggle(true);
              }}
            >
              <Search fontSize="small" />
            </Box>

            {/* Dark & Light Mode Icon */}
            <Box>
              <LightDarkSwitcher />
            </Box>
          </Stack>
        </Stack>
      )}

      {/* Small Device Search Box */}
      <SmallDeviceSearchBox
        guestCount={guestCount}
        updateGuest={updateGuest}
        smallDeviceFlatpickrRef={smallDeviceFlatpickrRef}
        smallDeviceGuestRef={smallDeviceGuestRef}
        showSmallDeviceGuestPopup={showSmallDeviceGuestPopup}
        setShowSmallDeviceGuestPopup={setShowSmallDeviceGuestPopup}
        showSmallDeviceSearch={showSmallDeviceSearch}
        setShowSmallDeviceSearch={setShowSmallDeviceSearch}
      />

      <HeaderDrawer drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
    </AppBar>
  );
}
