import { useAuth } from '@/contexts/authContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import { getSocket, initSocket } from '@/lib/socket';
import { maskConversationMessages } from '@/utils/maskConversationMessages';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, AvatarGroup, Box, Button, Drawer, IconButton, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import { format, isToday, isYesterday } from 'date-fns';
import { ChevronsLeft, ChevronsRight, Dot, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';
import GuestReservationDetails from '../GuestReservationDetails';
import HostReservationDetails from '../HostReservationDetails';
import ReceiverMessage from './ReceiverMessage';
import SenderMessage from './SenderMessage';

const Conversations = () => {
  const { trans } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { conversationId, messageType } = router.query;
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [input, setInput] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [messages, setMessages] = useState({});
  const [isTyping, setIsTyping] = useState(new Set());
  const [openBookingDetails, setOpenBookingDetails] = useState(true);

  const socketRef = useRef(null);
  const { data: conversationData, isLoading: isConversationLoading, error } = useSWR(`/api/messages/${conversationId}`, fetcher);
  console.log('%%conversationData', conversationData);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (conversationData) {
      const maskedMessagesArray = maskConversationMessages(conversationData?.messages);

      const grouped = maskedMessagesArray.reduce((acc, msg) => {
        const dateKey = format(new Date(msg.createdAt), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(msg);
        return acc;
      }, {});
      setMessages(grouped);
    }
  }, [conversationData]);

  useEffect(() => {
    markMessagesAsRead();
  }, [messages]);

  useEffect(() => {
    if (!user || !conversationId || !conversationData) return;

    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;

    socket.emit('joinConversation', { conversationBookingId: conversationData?.conversationBookingId });

    const currentUserId = user?.id;
    const otherUserIds = conversationData?.participants.filter((p) => p.id !== currentUserId).map((p) => p.id);

    const messageHandler = (msg) => {
      const masked = maskConversationMessages({ temp: [msg] })[0];
      const dateKey = format(new Date(masked.createdAt), 'yyyy-MM-dd');

      mutate(`/api/conversations`);
      mutate(`/api/messages/${conversationId}`);
    };

    const typingHandler = ({ senderId }) => {
      if (otherUserIds.includes(senderId)) {
        setIsTyping((prev) => new Set(prev).add(senderId));
      }
    };

    const stopTypingHandler = ({ senderId }) => {
      if (otherUserIds.includes(senderId)) {
        setIsTyping((prev) => {
          const updated = new Set(prev);
          updated.delete(senderId);
          return updated;
        });
      }
    };

    const messagesReadHandler = ({ userId, messageIds }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((dateKey) => {
          updated[dateKey] = updated[dateKey].map((msg) => {
            const reads = msg.reads || [];
            if (messageIds.includes(msg.id) && !reads.some((r) => r.userId === userId)) {
              msg.reads = [...reads, { userId, readAt: new Date() }];
            }
            return msg;
          });
        });
        return updated;
      });
    };

    const reservationUpdateHandler = () => {
      mutate(`/api/messages/${conversationId}`);
      mutate(`/api/conversations`);
    };

    socket.on('message', messageHandler);
    socket.on('typing', typingHandler);
    socket.on('stopTyping', stopTypingHandler);
    socket.on('messagesRead', messagesReadHandler);
    socket.on('reservationUpdate', reservationUpdateHandler);

    return () => {
      socket.off('message', messageHandler);
      socket.off('typing', typingHandler);
      socket.off('stopTyping', stopTypingHandler);
      socket.off('messagesRead', messagesReadHandler);
      socket.off('reservationUpdate', reservationUpdateHandler);
    };
  }, [user, conversationData, conversationId]);

  const handleTyping = () => {
    const socket = getSocket();
    socket.emit('typing', {
      senderId: user?.id,
      conversationBookingId: conversationData?.conversationBookingId,
    });

    setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: user?.id,
        conversationBookingId: conversationData?.conversationBookingId,
      });
    }, 2000);
  };

  const markMessagesAsRead = () => {
    if (!user || !conversationData) return;
    const socket = getSocket();

    socket.emit('markAsRead', {
      userId: user?.id,
      conversationBookingId: conversationData?.conversationBookingId,
    });
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const socket = getSocket();
    socket.emit('sendMessage', {
      senderId: user?.id,
      conversationBookingId: conversationData?.conversationBookingId,
      text: input,
    });
    setInput('');
  };

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  function formatChatDate(dateString) {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  }
  const BookingDetails = user?.id === conversationData?.lastBooking?.host?.id ? HostReservationDetails : GuestReservationDetails;

  if (isConversationLoading) return null;

  if (error) {
    router.replace('/error');
  }

  return (
    <Stack direction="row" flex={1} minHeight={0} height="100%">
      <Box flex={1} display="flex" flexDirection="column" borderRight={!isXs && '1px solid'} borderColor="divider" minHeight={0}>
        {/* Header */}
        <Box py={2} px={{ xs: 2, sm: 3, md: 2 }} borderBottom="1px solid" borderColor="divider" flexShrink={0}>
          {/* Icon for Small Devices */}
          {isXs ? (
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'start'}>
              {/* Back Button */}
              <IconButton sx={{ color: 'text.primary' }} component={Link} href="/host/messages">
                <ChevronsLeft size={20} />
              </IconButton>

              {/* Center Content */}
              <Box display="flex" flexDirection="column" alignItems="center">
                <AvatarGroup max={3} spacing={10}>
                  {conversationData?.participants.map((participant, i) => (
                    <Avatar key={i} alt={participant.name} src={participant.image} />
                  ))}
                </AvatarGroup>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  noWrap
                  component="span"
                  sx={{
                    maxWidth: { xs: 200, sm: 250 },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {conversationData?.participants.map((p) => p.name ?? '').join(', ')}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap maxWidth={250} display="flex" alignItems="center">
                  {conversationData?.lastBooking ? `${format(conversationData?.lastBooking.startDate, 'MMM dd')} - ${format(conversationData?.lastBooking.endDate, 'MMM dd')}` : ''}
                  {conversationData?.propertyDesc?.name && (
                    <>
                      <Dot />
                      {conversationData?.propertyDesc.name}
                    </>
                  )}
                </Typography>
              </Box>

              {/* Reservation Button */}
              <Button
                onClick={handleDrawerToggle}
                size="small"
                variant="outlined"
                color="inherit"
                sx={{
                  fontSize: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '20px',
                }}
              >
                {trans('Details')}
              </Button>
            </Stack>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <AvatarGroup
                  renderSurplus={(surplus) => (
                    <Box sx={{ color: 'common.white' }} component={'span'} className="text-[18px]">
                      +{surplus.toString()[0]}
                    </Box>
                  )}
                  max={3}
                  spacing={15}
                  sx={{
                    '& .MuiAvatar-root': {
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  {conversationData?.participants?.map((participant, i) => (
                    <Avatar variant="circular" alt={participant.name} src={participant.image} />
                  ))}
                </AvatarGroup>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  noWrap
                  component="span"
                  sx={{
                    maxWidth: 250,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {conversationData?.participants?.map((p) => p.name ?? '').join(', ')}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setOpenBookingDetails(!openBookingDetails)}
                sx={{
                  color: 'text.primary',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <ChevronsRight size={18} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Messages */}
        <Box flex={1} minHeight={0} overflow="auto" px={{ xs: 2, sm: 3, md: 2 }} pt={3} pb={{ xs: 10, md: 3 }} display="flex" flexDirection="column">
          {Object.entries(messages).map(([date, msgs]) => (
            <Stack key={date} gap={2}>
              <Typography variant="caption" color="text.primary" textAlign="center" fontWeight={600} mb={2}>
                {formatChatDate(date)}
              </Typography>
              {msgs.map((msg) => {
                const isOwnMessage = msg.sender.id === user?.id;
                if (msg.type === 'SYSTEM') {
                  return (
                    <Typography key={msg.id} variant="caption" color="text.secondary" textAlign="center" mb={2}>
                      {msg.text}
                    </Typography>
                  );
                }
                return isOwnMessage ? (
                  <ReceiverMessage key={msg.id} msg={msg} participants={conversationData?.participants} conversationData={conversationData} />
                ) : (
                  <SenderMessage key={msg.id} msg={msg} participants={conversationData?.participants} conversationData={conversationData} />
                );
              })}
            </Stack>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {isTyping.size > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            fontStyle="italic"
            px={{ xs: 2, sm: 3, md: 2 }}
            py={0.5}
            sx={{
              fontSize: 13,
              opacity: 0.75,
              letterSpacing: 0.3,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.4 },
                '50%': { opacity: 0.9 },
                '100%': { opacity: 0.4 },
              },
            }}
          >
            {(() => {
              const typingUsers = [...isTyping].map((id) => conversationData?.participants.find((p) => p.id === id)?.name).filter(Boolean);

              if (typingUsers.length === 1) {
                return `${typingUsers[0]} is typing...`;
              }
              if (typingUsers.length === 2) {
                return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
              }
              if (typingUsers.length > 2) {
                return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`;
              }
            })()}
          </Typography>
        )}

        {/* Input */}
        <Box flexShrink={0} borderTop={{ md: '1px solid' }} borderColor={{ md: 'divider' }} bgcolor="background.paper" py={2} px={{ xs: 2, sm: 3, md: 2 }} display="flex" alignItems="end">
          <TextField
            fullWidth
            multiline
            placeholder="Write your message..."
            value={input}
            rows={2}
            sx={{
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              '&:focus-within': { borderColor: 'primary.main' },
            }}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
          />
          <IconButton
            onClick={sendMessage}
            sx={{
              ml: -6,
              mb: 1,
              bgcolor: 'secondary.main',
              color: 'common.white',
              '&:hover': { bgcolor: 'secondary.dark' },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {/* Booking Details */}
      {openBookingDetails && !isXs && (
        <Box width={{ xs: '100%', md: '40%', lg: '30%' }} sx={{ overflowY: 'auto' }}>
          <BookingDetails conversationData={conversationData} />
        </Box>
      )}

      {/* Mobile Reservation Details Drawer */}
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: 1060,
        }}
      >
        <Box
          sx={{
            width: '100%',
            px: { xs: 2, sm: 5, md: 1.5, lg: 2 },
            py: 2,
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box onClick={handleDrawerToggle} sx={{ display: 'flex', justifyContent: 'end' }}>
            <X size={22} />
          </Box>
        </Box>

        {BookingDetails && (
          <Box sx={{ overflowY: 'auto' }}>
            <BookingDetails conversationData={conversationData} />
          </Box>
        )}
      </Drawer>
    </Stack>
  );
};

export default Conversations;
