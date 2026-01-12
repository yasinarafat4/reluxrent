import { Box, Card, Divider, Typography } from '@mui/material';
import { BriefcaseBusiness, Eye, FileLock } from 'lucide-react';

const infoItems = [
  {
    icon: <FileLock size={25} color="red" />,
    title: "Why isn't my information visible?",
    description: 'Some account details are hidden to help keep your identity secure.',
  },
  {
    icon: <BriefcaseBusiness size={25} color="red" />,
    title: 'What details can I update?',
    description: "You can change your contact and personal information. If any of it was used to verify your identity, you'll need to reverify before booking or hosting again.",
  },
  {
    icon: <Eye size={25} color="red" />,
    title: 'What details are shared with others?',
    description: 'ReluxRent only shares contact details with Hosts and guests after a booking is confirmed.',
  },
];

export default function InfoCardList() {
  return (
    <Card variant="outlined" sx={{ p: 2, mt: 5, borderRadius: 3, maxWidth: '100%', mx: 'auto' }}>
      {infoItems.map((item, index) => (
        <Box key={index}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box>{item.icon}</Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="body2">{item.description}</Typography>
            </Box>
          </Box>
          {index < infoItems.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Card>
  );
}
