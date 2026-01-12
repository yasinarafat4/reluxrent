import { Avatar, AvatarGroup, Box, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Dot } from 'lucide-react';

const Sidebar = ({ conversations, selectedConversation, handleConversationClick }) => {
  return (
    <List>
      {conversations.length > 0 &&
        conversations?.map((conversation, index) => (
          <ListItem
            key={index}
            selected={selectedConversation?.conversationId === conversation.conversationId}
            onClick={() => handleConversationClick(conversation.conversationId)}
            alignItems="flex-start"
            sx={{
              display: 'flex',
              border: '1px solid',
              borderColor: selectedConversation?.conversationId === conversation.conversationId ? 'primary.main' : 'divider',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              mb: 1,
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
                  spacing={5}
                >
                  {conversation.participants.map((participant, i) => (
                    <Avatar key={i} src={participant.image} alt={participant.name} />
                  ))}
                </AvatarGroup>
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" position={'relative'} alignItems="center" gap={2}>
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

                  {/* Date  */}
                  <Typography
                    sx={{
                      transition: 'opacity 0.2s',
                      width: 60,
                    }}
                    variant="caption"
                    component="span"
                    color="text.secondary"
                  >
                    {format(conversation.lastMessageAt, 'MMM dd')}
                  </Typography>
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
          </ListItem>
        ))}
    </List>
  );
};

export default Sidebar;
