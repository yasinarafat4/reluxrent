import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { Avatar, Box, Button, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import Image from 'next/image';

const SenderMessage = ({ msg, participants, conversationData }) => {
  const { user } = useAuth();
  const { actions } = usePopups();
  return (
    <Stack
      key={msg.id}
      direction="row"
      alignItems="start"
      gap={2}
      // onMouseEnter={() => setSenderHovered(true)}
      // onMouseLeave={() => setSenderHovered(false)}
    >
      <Stack direction="row" alignItems="end" gap={1}>
        <Avatar src={msg.sender.image} sx={{ height: 40, width: 40 }} />
        <Box>
          {msg?.metadata ? (
            <Stack height={300} width={300} p={1} gap={1} border={'1px solid'} borderColor={'divider'} borderRadius={1} bgcolor={'background.paper'}>
              <Box>
                <Typography
                  fontSize={13}
                  noWrap
                  sx={{
                    display: 'block',
                    width: '100%',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {msg?.text}
                </Typography>
                <Typography
                  fontSize={14}
                  noWrap
                  sx={{
                    display: 'block',
                    width: '100%',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                  fontWeight={600}
                >
                  {msg?.metadata?.title}
                </Typography>
                <Typography fontSize={13}>
                  {format(msg?.metadata?.dates?.start, 'MMM dd')} - {format(msg?.metadata?.dates?.end, 'MMM dd, yyyy')}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <Image src={msg?.metadata?.imageUrl} fill style={{ objectFit: 'cover', borderRadius: '4px' }} alt={msg?.metadata?.title} />
              </Box>
              {msg?.metadata?.action?.type == 'BookingConfirmed' ? (
                <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: '4px' }} onClick={() => actions.openPopup('hostBookingDetails', msg?.metadata?.bookingId)}>
                  {msg?.metadata?.action?.text}
                </Button>
              ) : msg?.metadata?.action?.type == 'BookingUnsuccessful' ? (
                <>
                  {user?.id == conversationData.guestId && (
                    <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: '4px' }} onClick={() => actions.openPopup(msg?.metadata?.action?.link, conversationData)}>
                      {msg?.metadata?.action?.text}
                    </Button>
                  )}
                </>
              ) : (
                ''
              )}
            </Stack>
          ) : (
            <Typography
              bgcolor="divider"
              color="text.primary"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 12,
              }}
              border="1px solid"
              borderColor="divider"
              px={{ xs: 1, md: 2 }}
              py={1}
              fontSize={{ xs: 12, md: 13 }}
            >
              {msg.text}
            </Typography>
          )}
          <Typography fontSize={{ xs: 10, md: 11 }}>{format(new Date(msg.createdAt), 'hh:mm a')}</Typography>
        </Box>
      </Stack>

      {/*TODO: Actions Button
                    <IconButton
                      sx={{ display: senderHovered ? 'block' : 'none', color: 'text.primary' }}
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSenderMenuOpen(e, msg);
                      }}
                    >
                      <Ellipsis size={20} />
                    </IconButton>

                    Actions Menu
                    <Menu
                      anchorEl={senderAnchorEl}
                      open={openSenderMenu}
                      onClose={handleSenderMenuClose}
                      anchorOrigin={anchorOrigin}
                      transformOrigin={transformOrigin}
                      onClick={(e) => e.preventDefault()}
                    >
                      <MenuItem onClick={handleSenderMenuClose}>
                        <ListItemIcon sx={{ color: 'text.primary' }}>
                          <Copy size={18} />
                        </ListItemIcon>
                        <ListItemText>{trans('Copy')}</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleSenderMenuClose}>
                        <ListItemIcon sx={{ color: 'text.primary' }}>
                          <CornerUpRight size={18} />
                        </ListItemIcon>
                        <ListItemText>{trans('Replay')}</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => handelShowPopup('reportMessage')} mt={2}>
                        <ListItemIcon sx={{ color: 'text.primary' }}>
                          <Flag size={18} />
                        </ListItemIcon>
                        <ListItemText>{trans('Report this message')}</ListItemText>
                      </MenuItem>
                    </Menu> */}
    </Stack>
  );
};

export default SenderMessage;
