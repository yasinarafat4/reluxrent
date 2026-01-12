import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  Bell,
  BookMarked,
  ChevronRight,
  CircleUser,
  Globe,
  Heart,
  HelpCircle,
  House,
  Lock,
  LogIn,
  LogOut,
  LucideMessageCircleQuestion,
  MessagesSquare,
  NotepadText,
  PlusSquare,
  Repeat,
  Search,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import Link, { default as NextLink } from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Avatar from 'react-avatar';

const hostingData = [
  { label: 'Earnings', icon: <Wallet size={20} />, route: '/host/earnings' },
  { label: 'Create a new listing', icon: <PlusSquare size={20} />, route: '/host/property/create' },
];

const accountData = [
  { label: 'Your profile', icon: <User size={20} />, route: '/user/profile' },
  { label: 'Settings', icon: <Settings size={20} />, route: '/account-settings' },
  { label: 'Notifications', icon: <Bell size={20} />, route: '/host/notifications' },
  { label: 'Visit the Help Center', icon: <HelpCircle size={20} />, route: '/help' },
];

export default function MobileNavigation() {
  const { trans } = useTranslation();
  const router = useRouter();
  const { messageType } = router.query;
  const { actions } = usePopups();
  const currentPath = router.pathname;

  const sxDesign = [
    {
      '& .MuiBottomNavigationAction-label': {
        fontSize: '12px',
      },
      color: 'text.secondary',
      '&.Mui-selected': {
        color: 'primary.main',
      },
      '&.Mui-selected .MuiBottomNavigationAction-label': {
        fontSize: '13px',
      },
      color: 'common.black',
    },
  ];

  const { user, handleLogout } = useAuth();
  const [openHostingMenu, setOpenHostingMenu] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuItemsOne = [
    { text: trans('Account Settings'), icon: <Settings size={20} />, route: '/account-settings' },
    { text: trans('View Profile'), icon: <CircleUser size={20} />, route: '/user/profile' },
    { text: trans('Notifications'), icon: <Bell size={20} />, route: '/guest/notifications' },
    {
      text: trans('Languages & Currency'),
      icon: <Globe size={22} />,
      onClick: () => actions.openPopup('languageAndCurrency', 'language'),
    },
  ];

  const menuItemsTwo = [
    { text: trans('Privacy'), icon: <Lock size={20} />, route: '/help/privacy-policy' },
    { text: trans('Get Help'), icon: <LucideMessageCircleQuestion size={20} />, route: '/help' },
  ];

  const ListItemTextDesign = { '& .MuiTypography-root': { fontSize: { xs: '12px', sm: '15px' } } };

  const toggleDrawer = (field) => {
    if (field == 'hostingMenu') {
      setOpenHostingMenu((prev) => !prev);
    } else if (field == 'profileMenu') {
      setOpenProfileMenu((prev) => !prev);
    }
  };

  const isActive = (path) => {
    return currentPath === path || (path === '/host' && currentPath.startsWith('/host')) || (path === '/' && currentPath === '/') || (path === '/guest' && currentPath.startsWith('/guest'));
  };

  const ProfileMenuList = (
    <Box sx={{ width: { xs: 330, sm: 400 }, px: 3, pb: 7, pt: 10 }} onClick={() => setOpenProfileMenu(false)}>
      <Box display="flex" flexDirection={'column'} alignItems="center" gap={1}>
        {/* Profile Card */}
        <Card
          sx={{
            width: '100%',
            p: 3,
            textAlign: 'center',
          }}
          elevation={4}
        >
          <CardContent>
            <Box border={'1px solid'} width={'80px'} mx={'auto'} borderColor={'divider'} borderRadius={'100%'}>
              <Avatar src={user?.image} name={user?.name} alt={user?.name} size="80" round={true} />
            </Box>

            <Typography sx={{ fontSize: 25, fontWeight: 700 }}>{user?.name}</Typography>
            <Typography variant="body2">{trans('Guest')}</Typography>
          </CardContent>
        </Card>

        {user ? (
          <Button
            component={Link}
            href="/host/today?type=today"
            variant="contained"
            startIcon={<Repeat size={16} />}
            sx={{
              width: '100%',
              bgcolor: 'black',
              color: 'white',
              borderRadius: '9999px',
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 600,
              px: 2.5,
              py: 1,
            }}
          >
            {trans('Switch to Hosting')}
          </Button>
        ) : (
          <Card sx={{ minWidth: 275, '& .MuiCardContent-root:last-child': { paddingBottom: '10px' }, display: { xs: 'block', md: 'none' } }} elevation={4}>
            <CardContent sx={{ padding: '10px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ fontSize: '1.5rem' }}>
                  🏠
                </Box>
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                >
                  {trans('Become a Host')}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '13px' }} variant="body2" color="text.secondary">
                {trans('List your space and earn money.')}
              </Typography>
            </CardContent>
          </Card>
        )}
        <Box role="presentation" sx={{ width: '100%', display: { xs: 'block', md: 'none' } }}>
          <List>
            {menuItemsOne.map((item, index) => {
              const content = (
                <ListItem disablePadding key={index}>
                  <ListItemButton key={index} onClick={item.onClick} selected={isActive(item.route)}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'text.primary' }}>{item.icon}</ListItemIcon>
                    <ListItemText sx={ListItemTextDesign} primary={item.text} />
                    <ListItemIcon sx={{ minWidth: 36, color: 'text.primary' }}>
                      <ChevronRight size={20} />
                    </ListItemIcon>
                  </ListItemButton>
                </ListItem>
              );

              // If route exists, wrap in Link
              return item.route ? (
                <Link key={index} href={item.route} passHref style={{ textDecoration: 'none' }}>
                  {content}
                </Link>
              ) : (
                content
              );
            })}
          </List>

          <Divider />
          <List>
            {menuItemsTwo.map((item, index) => (
              <ListItem key={index} component={Link} href={item.route} disablePadding>
                <ListItemButton key={index} selected={isActive(item.route)}>
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: 'text.primary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText sx={ListItemTextDesign} primary={item.text} />
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: 'text.primary',
                    }}
                  >
                    <ChevronRight size={20} />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: 'text.primary',
                  }}
                >
                  <LogOut size={20} />
                </ListItemIcon>
                <ListItemText sx={ListItemTextDesign} primary={'Logout'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Box>
  );

  const HostingMenuList = (
    <Box sx={{ width: { xs: 330, sm: 400 }, px: 3, py: 10 }} onClick={() => setOpenHostingMenu(false)}>
      {/* Early Access */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Typography fontSize={14}>Get Early Access</Typography>
        <Chip
          label="New"
          size="small"
          color="error"
          sx={{
            fontWeight: 'bold',
            '& .MuiChip-label': {
              fontSize: '10px',
              padding: '0 10px',
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />
      <Button
        component={NextLink}
        href="/"
        variant="contained"
        startIcon={<Repeat size={16} />}
        sx={{
          width: '100%',
          bgcolor: 'black',
          color: 'white',
          borderRadius: '9999px',
          textTransform: 'none',
          fontSize: '15px',
          fontWeight: 600,
          px: 2.5,
          py: 1,
        }}
      >
        {trans('Switch to Traveling')}
      </Button>
      <Divider sx={{ my: 1 }} />

      {/* Hosting Section */}
      <Typography variant="overline" color="text.secondary" mt={3} mb={1}>
        {trans('Hosting')}
      </Typography>

      <List disablePadding>
        {hostingData.map((item, i) => (
          <ListItem component={Link} href={item.route} key={i} disablePadding>
            <ListItemButton selected={isActive(item.route)}>
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: 'text.primary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText sx={{ '& .MuiTypography-root': { fontSize: { xs: '13px', sm: '15px' } } }} primary={item.label} />
              <ChevronRight size={18} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />
      {/* Account Section */}
      <Typography variant="overline" color="text.secondary" mb={1}>
        {trans('Account')}
      </Typography>
      <List disablePadding>
        {accountData.map((item, i) => (
          <ListItem component={Link} href={item.route} key={i} disablePadding>
            <ListItemButton>
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: 'text.primary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText sx={{ '& .MuiTypography-root': { fontSize: { xs: '13px', sm: '15px' } } }} primary={item.label} />
              <ChevronRight size={18} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* App & Logout Buttons */}
      <Divider sx={{ my: 1 }} />
      <Stack gap={1} my={1} textAlign="center">
        <Button variant="outlined" fullWidth>
          {trans('Download the app')}
        </Button>
        <Button onClick={handleLogout} variant="contained" color="inherit" fullWidth>
          {trans('Log out')}
        </Button>
      </Stack>

      {/* Footer Links */}
      <Box textAlign="center">
        <Typography variant="caption" color="text.secondary">
          <Link href="#" underline="hover">
            {trans('Terms of Service')}
          </Link>{' '}
          ·{' '}
          <Link href="#" underline="hover">
            {trans('Privacy Policy')}
          </Link>
        </Typography>

        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          © 2025 Pixelbnb, Inc. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: router.pathname.includes('/edit') ? 'none' : 'block', md: 'none' }, zIndex: 1100, p: 0.5, borderRadius: 0 }}
      elevation={3}
    >
      {user ? (
        <>
          {router.pathname.startsWith('/host') || messageType == 'host' ? (
            <BottomNavigation showLabels value={currentPath}>
              <BottomNavigationAction component={NextLink} href="/host/today?type=today" sx={sxDesign} label={trans('Today')} value="/host" icon={<House size={20} />} selected={isActive('/host')} />

              <BottomNavigationAction
                component={NextLink}
                href="/host/listings?type=home&status=All"
                sx={sxDesign}
                label={trans('Listings')}
                value="/host/listings"
                icon={<NotepadText size={20} />}
                selected={isActive('/host/listings')}
              />

              <BottomNavigationAction
                component={NextLink}
                href="/host/reservations?type=home&status=All"
                sx={sxDesign}
                label={trans('Reservations')}
                value="/host/reservations"
                icon={<BookMarked size={20} />}
                selected={isActive('/host/reservations')}
              />
              <BottomNavigationAction
                component={NextLink}
                href="/host/messages"
                sx={sxDesign}
                label={trans('Messages')}
                value="/host/messages"
                icon={<MessagesSquare size={20} />}
                selected={isActive('/host/messages')}
              />
              <BottomNavigationAction
                onClick={() => toggleDrawer('hostingMenu')}
                sx={sxDesign}
                label={trans('Menu')}
                value="menu"
                selected={openHostingMenu}
                icon={
                  user?.image ? (
                    <Avatar src={user.image} alt={user.name} size="25" round={true} />
                  ) : (
                    <Avatar {...(user ? { name: user.name } : { facebookId: '100008343750912' })} size="25" round={true} />
                  )
                }
              />
              <Drawer sx={{ zIndex: 1050 }} open={openHostingMenu} onClose={() => setOpenHostingMenu(false)}>
                {HostingMenuList}
              </Drawer>
            </BottomNavigation>
          ) : (
            <BottomNavigation showLabels value={currentPath}>
              <BottomNavigationAction component={NextLink} href="/" sx={sxDesign} label={trans('Explore')} value="/" icon={<Search size={20} />} selected={isActive('/')} />
              <BottomNavigationAction
                component={NextLink}
                href="/guest/wishlist"
                sx={sxDesign}
                label={trans('Wishlists')}
                value="/guest/wishlist"
                icon={<Heart size={20} />}
                selected={isActive('wishlist')}
              />
              <BottomNavigationAction
                component={NextLink}
                href="/guest/bookings?type=home&status=All"
                sx={sxDesign}
                label={trans('Bookings')}
                value="/guest/bookings"
                icon={<BookMarked size={20} />}
                selected={isActive('/bookings')}
              />
              <BottomNavigationAction
                component={NextLink}
                href="/guest/messages"
                sx={sxDesign}
                label={trans('Messages')}
                value="/guest/messages"
                icon={<MessagesSquare size={20} />}
                selected={isActive('/messages')}
              />

              <BottomNavigationAction
                onClick={() => toggleDrawer('profileMenu')}
                sx={sxDesign}
                label={trans('Profile')}
                value="profile"
                selected={openProfileMenu}
                icon={
                  user?.image ? (
                    <Avatar src={user.image} alt={user.name} size="25" round={true} />
                  ) : (
                    <Avatar {...(user ? { name: user.name } : { facebookId: '100008343750912' })} size="25" round={true} />
                  )
                }
              />
              <Drawer sx={{ zIndex: 1050 }} open={openProfileMenu} onClose={() => setOpenProfileMenu(false)}>
                {ProfileMenuList}
              </Drawer>
            </BottomNavigation>
          )}
        </>
      ) : (
        <BottomNavigation showLabels value={currentPath}>
          <BottomNavigationAction component={NextLink} href="/" sx={sxDesign} label={trans('Explore')} value="/" icon={<Search size={20} />} selected={isActive('/')} />
          <BottomNavigationAction component={NextLink} href="/login" sx={sxDesign} label={trans('Login')} value="/login" icon={<LogIn size={20} />} selected={isActive('/login')} />
        </BottomNavigation>
      )}
    </Paper>
  );
}
