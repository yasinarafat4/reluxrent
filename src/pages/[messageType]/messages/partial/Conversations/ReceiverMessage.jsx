import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { Box, Button, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import Image from 'next/image';
import Avatar from 'react-avatar';

const ReceiverMessage = ({ msg, participants, conversationData }) => {
  const { user } = useAuth();
  const { actions } = usePopups();
  return (
    <Stack alignItems="end" justifyContent="end">
      <Stack
        key={msg.id}
        direction="row"
        alignItems="start"
        justifyContent="end"
        gap={2}
        // onMouseEnter={() => setReceiverHovered(true)}
        // onMouseLeave={() => setReceiverHovered(false)}
      >
        {/* TODO: Actions Button
                        <IconButton
                          sx={{ display: receiverHovered ? 'block' : 'none', color: 'text.primary' }}
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            handleReceiverMenuOpen(e, msg);
                          }}
                        >
                          <Ellipsis size={20} />
                        </IconButton>

                        Actions Menu
                        <Menu
                          anchorEl={receiverAnchorEl}
                          open={openReceiverMenu}
                          onClose={handleReceiverMenuClose}
                          anchorOrigin={anchorOrigin}
                          transformOrigin={transformOrigin}
                          onClick={(e) => e.preventDefault()}
                        >
                          <MenuItem onClick={handleReceiverMenuClose}>
                            <ListItemIcon sx={{ color: 'text.primary' }}>
                              <SquarePen size={18} />
                            </ListItemIcon>
                            <ListItemText>{trans('Edit')}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleReceiverMenuClose}>
                            <ListItemIcon sx={{ color: 'text.primary' }}>
                              <Copy size={18} />
                            </ListItemIcon>
                            <ListItemText>{trans('Copy')}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleReceiverMenuClose}>
                            <ListItemIcon sx={{ color: 'text.primary' }}>
                              <CornerUpRight size={18} />
                            </ListItemIcon>
                            <ListItemText>{trans('Replay')}</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={handleReceiverMenuClose}>
                            <ListItemIcon sx={{ color: 'text.primary' }}>
                              <Trash size={18} />
                            </ListItemIcon>
                            <ListItemText>{trans('Unsend')}</ListItemText>
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={() => handelShowPopup('messageReadBy')} mt={2}>
                            <ListItemIcon sx={{ color: 'text.primary' }}>
                              <Eye size={18} />
                            </ListItemIcon>
                            <ListItemText>{trans('Message read by')}</ListItemText>
                          </MenuItem>
                        </Menu> */}

        <Stack direction="row" alignItems="end" gap={1}>
          <Stack direction="column" alignItems="end">
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

                <>
                  {msg?.metadata?.action?.type == 'BookingConfirmed' ? (
                    <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: '4px' }} onClick={() => actions.openPopup('guestBookingDetails', msg?.metadata?.bookingId)}>
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
                </>
              </Stack>
            ) : (
              <Typography
                bgcolor="secondary.main"
                color="common.white"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 0,
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
          </Stack>
          <Box border={'1px solid'} borderColor={'divider'} borderRadius={'100%'}>
            <Avatar src={msg?.sender?.image} name={msg?.sender?.name} alt={msg?.sender?.name} round={true} size="40" />
          </Box>
        </Stack>
      </Stack>
      {msg.reads.length > 0 && (
        <Stack direction="row" justifyContent={'center'} alignItems="center" fontSize={{ xs: 11, md: 12 }} gap={0.5} mt={1}>
          Read by{' '}
          <Typography fontWeight={500} fontSize={{ xs: 11, md: 12 }} variant="body2">
            {msg.reads
              .map((r) => {
                const user = participants.find((p) => p.id === r.userId);
                return user ? user.name : null;
              })
              .filter(Boolean)
              .join(', ')}
          </Typography>
          <Stack direction="row">
            {msg.reads.map((r) => {
              const user = participants.find((p) => p.id === r.userId);
              return (
                user && (
                  <Box height={15} width={16} p={0}>
                    <Avatar key={user.id} src={user.image} name={user.name} alt={user.name} round={true} size="15" />{' '}
                  </Box>
                )
              );
            })}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default ReceiverMessage;
