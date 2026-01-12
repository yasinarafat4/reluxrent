import { useTranslation } from '@/contexts/TranslationContext';
import { Avatar, AvatarGroup, Box, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { Archive, Dot, Ellipsis, MessageSquareDot, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const MessageSidebar = ({ conversations }) => {
  const router = useRouter();
  const { messageType } = router.query;
  const { trans } = useTranslation();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState();
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    if (anchorEl && anchorEl === event.currentTarget) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box borderRight={!isXs && '1px solid'} borderColor={'divider'} p={{ xs: 2, md: 1.5, lg: 2 }} height={'100%'} width={'100%'}>
      <Typography variant="h5">{trans('All Messages')}</Typography>

      <List>
        {conversations.length > 0 &&
          conversations?.map((conversation, index) => (
            <ListItem
              component={Link}
              href={`/${messageType}/messages/${conversation.conversationId}`}
              key={index}
              alignItems="flex-start"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex()}
              sx={{
                border: '1px solid',
                borderColor: router.asPath == `/${messageType}/messages/${conversation.conversationId}` ? 'primary.main' : 'divider',
                borderRadius: 1,
                display: 'flex',
                gap: 2,
                p: 2,
                mb: 1.5,
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'background.paper' },
              }}
            >
              <ListItemAvatar>
                <Box position={'relative'}>
                  <Avatar sx={{ height: 70, width: 70, borderRadius: 1 }} variant="square" src={conversation?.property?.propertyImages[0]?.image}></Avatar>
                  <AvatarGroup
                    renderSurplus={(surplus) => (
                      <Box sx={{ color: 'common.white' }} component={'span'} className="text-[14px]">
                        +{surplus.toString()[0]}
                      </Box>
                    )}
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      right: -2,
                      '& .MuiAvatar-circular': {
                        height: 25,
                        width: 25,
                      },
                    }}
                    max={3}
                    spacing={7}
                  >
                    {conversation.participants.map((participant, i) => (
                      <Avatar key={i} src={participant.image} alt={participant.name} />
                    ))}
                  </AvatarGroup>
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" position={'relative'} alignItems="center" gap={4}>
                    <Stack
                      direction="row"
                      gap={0.5}
                      sx={{
                        maxWidth: 250,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Typography title={conversation.participants.map((participant) => participant.name).join(', ')} variant="body1" fontWeight="bold" noWrap component="span">
                        {conversation.participants.map((participant) => participant.name).join(', ')}
                      </Typography>
                    </Stack>

                    {/* Date and Actions */}
                    <Box sx={{ zIndex: 1000 }}>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: 1,
                          top: 0,
                          zIndex: 1,
                          transition: 'opacity 0.2s',
                          opacity: hoveredIndex == index ? 1 : 0,
                          color: 'text.primary',
                        }}
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMenuOpen(e);
                        }}
                      >
                        <Ellipsis size={20} />
                      </IconButton>
                      <Typography
                        sx={{
                          position: 'absolute',
                          right: 1,
                          top: 5,
                          transition: 'opacity 0.2s',
                          opacity: hoveredIndex == index ? 0 : 1,
                        }}
                        variant="caption"
                        component="span"
                        color="text.secondary"
                      >
                        {format(conversation.lastMessageAt, 'MMM dd')}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      component="span"
                      color="text.primary"
                      noWrap
                      sx={{
                        display: 'inline-block',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {conversation?.lastMessage?.text}
                      {/* *** */}
                    </Typography>
                    <Typography variant="caption" component="span" color="text.secondary" display="flex" alignItems="center">
                      {conversation.lastBooking ? `${format(conversation.lastBooking.startDate, 'MMM dd')} - ${format(conversation.lastBooking.endDate, 'MMM dd')}` : ''}
                      <Dot />
                      {conversation?.property?.propertyDescription?.name}
                    </Typography>
                  </Box>
                }
                slotProps={{
                  primary: { component: 'div' }, // replaces primaryTypographyProps
                  secondary: { component: 'div' }, // replaces secondaryTypographyProps
                }}
              />

              {/* Popover Menu */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClick={(e) => e.preventDefault()}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>
                    <MessageSquareDot size={18} />
                  </ListItemIcon>
                  <ListItemText>{trans('Mark as unread')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>
                    <Star size={18} />
                  </ListItemIcon>
                  <ListItemText>{trans('Star')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon sx={{ color: 'text.primary' }}>
                    <Archive size={18} />
                  </ListItemIcon>
                  <ListItemText>{trans('Archive')}</ListItemText>
                </MenuItem>
              </Menu>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default MessageSidebar;
