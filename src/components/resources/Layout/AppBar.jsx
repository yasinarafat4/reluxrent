import { Badge, Box, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { AppBar, Logout, TitlePortal, UserMenu } from 'react-admin';

import { BellIcon, Globe, UserPen } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

import { ListItemIcon, ListItemText } from '@mui/material';
import { useUserMenu } from 'react-admin';
import { Link } from 'react-router-dom';

const SettingsMenuItem = (props, ref) => {
  const userMenuContext = useUserMenu();

  if (!userMenuContext) {
    throw new Error('<SettingsMenuItem> should be used inside a <UserMenu>');
  }
  const { onClose } = userMenuContext;
  return (
    <MenuItem onClick={onClose} ref={ref} component={Link} to="/profile" {...props}>
      <ListItemIcon>
        <UserPen />
      </ListItemIcon>
      <ListItemText>Profile</ListItemText>
    </MenuItem>
  );
};

const CustomAppBar = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isLargeEnough = useMediaQuery((theme) => theme.breakpoints.up('sm'));

  // Toggle notification list visibility
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the notification list
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      {...props}
      color="secondary"
      userMenu={
        <UserMenu>
          <SettingsMenuItem />
          <Logout />
        </UserMenu>
      }
    >
      <TitlePortal />
      {isLargeEnough && <Logo />}
      {isLargeEnough && <Box component="span" sx={{ flex: 1 }} />}
      <IconButton title="Visit Website" href="/" target="_blank">
        <Globe />
      </IconButton>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={4} color="secondary">
          <BellIcon />
        </Badge>
      </IconButton>
      {/* Notification List (Menu) */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Notification 1</MenuItem>
        <MenuItem onClick={handleClose}>Notification 2</MenuItem>
        <MenuItem onClick={handleClose}>Notification 3</MenuItem>
        <MenuItem onClick={handleClose}>Notification 4</MenuItem>
        {/* Add more notifications here */}
      </Menu>
    </AppBar>
  );
};

export default CustomAppBar;
