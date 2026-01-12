'use client';

import LightDarkSwitcher from '@/components/LightDarkSwitcher';
import { useAuth } from '@/contexts/authContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import { AppBar, Badge } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bell, Globe, Heart, Lock, LogIn, LogOut, LucideMessageCircleQuestion, MenuIcon, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Avatar from 'react-avatar';
import logo from '../../../../public/images/logos/reluxrent.png';

const menuItems = [
  { label: 'Today', href: '/host/today?type=today', key: 'today' },
  { label: 'Listings', href: '/host/listings?type=home&status=All', key: 'listings' },
  { label: 'Reservations', href: '/host/reservations?type=home&status=All', key: 'reservations' },
  { label: 'Messages', href: '/host/messages', key: 'messages' },
  { label: 'Earnings', href: '/host/earnings', key: 'earnings' },
];

export default function HostingHeader() {
  const { trans } = useTranslation();
  const { user, handleLogout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const currentPath = router.pathname;
  const { actions } = usePopups();

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <AppBar
      sx={{
        bgcolor: 'background.primary',
        color: 'text.primary',
        boxShadow: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        position="relative"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          height: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1,
          px: { xs: 1.5, sm: 3 },
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.standard,
              easing: theme.transitions.easing.easeInOut,
            }),
        }}
      >
        {/* Logo */}
        <Box width={'100%'}>
          <Link href={'/host/today?type=today'} className="flex items-center">
            <Image width={100} height={50} src={logo} alt="Logo" />
          </Link>
        </Box>

        {/* Nav Menu's */}
        <Box display={{ xs: 'none', md: 'flex' }} alignItems={'center'} justifyContent={'center'} gap={{ md: 0.1, lg: 2 }}>
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <Typography
                sx={{
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  fontSize: { md: '13px', lg: '15px' },
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: currentPath.includes(item.key) ? (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200') : '',
                  transition: '0.3s',
                  '&:hover': {
                    backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
                  },
                }}
              >
                {item.label}
              </Typography>
            </Link>
          ))}
        </Box>
        {/* End Items (desktop only) */}
        <Box display={{ xs: 'none', md: 'flex' }} justifyContent={'end'} alignItems={'center'} textAlign={'center'} gap={{ md: 0.1, lg: 1 }}>
          <Link href={'/'}>
            {/* Switches */}
            <Typography
              sx={{
                fontWeight: 500,
                px: { md: 0.5, lg: 2 },
                py: 1,
                fontSize: { md: '13px', lg: '15px' },
                borderRadius: '999px',
                cursor: 'pointer',
                transition: '0.3s',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'grey.900',
                  color: 'common.white',
                },
              }}
            >
              {trans('Switch to Travelling')}
            </Typography>
          </Link>

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
            open={profileMenuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {user
              ? [
                  <Link href={'/user/profile'}>
                    <MenuItem onClick={handleMenuClose}>
                      {user && <Avatar src={user?.image} name={user?.name} alt={user?.name} className="mr-3" size="25" round={true} />}
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
                  <Link href={'/account-settings'}>
                    <MenuItem>
                      <ListItemIcon
                        sx={{
                          color: 'text.primary',
                        }}
                      >
                        <Settings size={18} />
                      </ListItemIcon>
                      {trans('Account Settings')}
                    </MenuItem>
                  </Link>,
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
                  <MenuItem>
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <Lock size={18} />
                    </ListItemIcon>
                    {trans('Privacy')}
                  </MenuItem>,
                  <MenuItem>
                    <ListItemIcon
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      <LucideMessageCircleQuestion size={18} />
                    </ListItemIcon>
                    {trans('Help')}
                  </MenuItem>,
                  <Link href="/login">
                    <MenuItem>
                      <ListItemIcon
                        sx={{
                          color: 'text.primary',
                        }}
                      >
                        <LogIn size={18} />
                      </ListItemIcon>
                      {trans('Login')}
                    </MenuItem>
                  </Link>,
                ]}
          </Menu>
        </Box>

        {/* End Items (small device only) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'end', alignItems: 'center', gap: 1, textAlign: 'end' }}>
          {/* Dark & Light Mode Icons */}
          <LightDarkSwitcher />
        </Box>
      </Box>
    </AppBar>
  );
}
