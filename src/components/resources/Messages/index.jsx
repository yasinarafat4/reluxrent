import api from '@/lib/api';
import { initSocket } from '@/lib/socket';
import { Avatar, AvatarGroup, Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { format, isToday, isYesterday } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useAuthenticated } from 'react-admin';
import DetailsSidebar from './Partials/DetailsSidebar';
import ReceiverMessage from './Partials/ReceiverMessage';
import SenderMessage from './Partials/SenderMessage';
import Sidebar from './Partials/Sidebar';

const Messages = () => {
  useAuthenticated();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationData, setSelectedConversationData] = useState(null);
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Load all users
  useEffect(() => {
    api.get('/api/conversations').then((res) => {
      setConversations(res.data);
    });
  }, []);

  // On conversation click, load full conversation by ID
  const handleConversationClick = (conversationId) => {
    api.get(`/api/conversation/${conversationId}`).then((res) => {
      const conv = res.data;
      setSelectedConversationData(conv);

      setMessages(conv.messages);
    });
  };

  // ✅ Scroll to bottom whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ✅ Socket listeners (for live updates)
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = initSocket();
    }
    const socket = socketRef.current;

    socket.emit('joinAdmin'); // 👈 tell backend this is an admin connection

    socket.on('connect', () => {
      console.log('✅ Connected as Admin:', socket.id);
    });

    const messageHandler = (message) => {
      console.log('message', message);
      handleConversationClick(message.conversationBooking.conversationId);
    };

    socket.on('message', messageHandler);

    return () => {
      socket.off('message', messageHandler);
    };
  }, []);

  function formatChatDate(dateString) {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  }

  return (
    <Box display="flex" gap={0.5} marginTop={1} height="calc(100vh - 70px)">
      {/* Left Sidebar: All Conversations */}
      <Paper sx={{ width: '23%', overflowY: 'auto' }}>
        <Typography variant="h6" fontWeight={600} sx={{ p: 2 }}>
          Conversations
        </Typography>
        <Divider />
        <Box px={1}>
          <Sidebar conversations={conversations} selectedConversation={selectedConversationData} handleConversationClick={handleConversationClick} />
        </Box>
      </Paper>

      {/* Middle Column: Messages */}
      <Box height={'100%'} display="flex" gap={0.5} sx={{ flex: 1 }}>
        {selectedConversationData ? (
          <>
            <Paper sx={{ flex: 1, height: '100%' }}>
              <Box display="flex" p={1.5} alignItems="center" gap={2}>
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
                  {selectedConversationData?.participants.map((participant, i) => (
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
                  {selectedConversationData.participants.map((participant) => participant.name).join(', ')}
                </Typography>
              </Box>
              <Divider />
              {/* Messages */}
              <Box height={'calc(100% - 80px)'} overflow={'auto'} px={{ xs: 2, sm: 3, md: 2 }} pt={3} pb={{ xs: 10, md: 3 }}>
                {Object.entries(messages).map(([date, msgs]) => (
                  <Stack key={date} gap={2}>
                    <Typography variant="caption" color="text.primary" textAlign="center" fontWeight={600} mb={2}>
                      {formatChatDate(date)}
                    </Typography>
                    {msgs.map((msg) => {
                      const isOwnMessage = msg.sender.id === selectedConversationData?.lastBooking?.host?.id;
                      if (msg.type === 'SYSTEM') {
                        return (
                          <Typography key={msg.id} variant="caption" color="text.secondary" textAlign="center" mb={2}>
                            {msg.text}
                          </Typography>
                        );
                      }
                      return isOwnMessage ? (
                        <ReceiverMessage key={msg.id} msg={msg} participants={selectedConversationData?.participants} conversationData={selectedConversationData} />
                      ) : (
                        <SenderMessage key={msg.id} msg={msg} participants={selectedConversationData?.participants} conversationData={selectedConversationData} />
                      );
                    })}
                  </Stack>
                ))}
                <div ref={messagesEndRef} />
              </Box>
            </Paper>

            {/* Right Sidebar: Booking Details */}
            <Paper sx={{ width: '30%', overflowY: 'auto' }}>
              <Typography variant="h6" fontWeight={600} sx={{ p: 2 }}>
                Booking Details
              </Typography>
              <Divider />
              <Box px={1}>
                <DetailsSidebar bookingDetails={selectedConversationData} />
              </Box>
            </Paper>
          </>
        ) : (
          <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            <Typography variant="h4" color="text.secondary" fontWeight={500}>
              Select a conversation to view messages.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Messages;
