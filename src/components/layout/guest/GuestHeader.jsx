'use client';

import LightDarkSwitcher from '@/components/LightDarkSwitcher';
import { useAuth } from '@/contexts/authContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';
import { AppBar, Badge, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bell, Globe, Heart, Lock, LogIn, LogOut, LucideMessageCircleQuestion, MenuIcon, MessageSquareMore, NotepadText, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Avatar from 'react-avatar';
import logo from '../../../../public/images/logos/reluxrent.png';

export default function GuestHeader() {
  const { trans } = useTranslation();
  const { user, handleLogout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const { actions } = usePopups();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const menuOpen = Boolean(menuAnchorEl);

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
      {/* Popup */}

      <Box
        position="relative"
        sx={{
          display: 'flex',
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
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={{ xs: '100%', md: 'auto' }}>
          <Link href="/" className="flex items-center">
            <Image width={100} height={50} src={logo} alt="Logo" />
          </Link>
          {/* Dark & Light Mode Icons */}
          <Box
            sx={{
              display: { md: 'none' },
            }}
          >
            <LightDarkSwitcher />
          </Box>
        </Stack>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, textAlign: 'center' }}>
          <Link href={'/host/today?type=today'}>
            {/* Switches */}
            <Typography
              sx={{
                fontWeight: 500,
                px: 2,
                py: 1,
                fontSize: '15px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: '0.3s',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'grey.900',
                  color: 'grey.50',
                },
              }}
            >
              {trans('Switch to Hosting')}
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
          {/* Menu */}
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
      </Box>
    </AppBar>
  );
}
