// pages/account-settings/index.js
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { Receipt, ShieldBan, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const sections = [
  { key: 'personal-info', label: 'Personal information', icon: <User size={20} /> },
  { key: 'login-and-security', label: 'Login & security', icon: <ShieldBan size={20} /> },
  { key: 'payments&method=payments', label: 'Payments', icon: <Receipt size={20} /> },
  // { key: 'privacy', label: 'Privacy', icon: <FileLock2 size={20} /> },
  // { key: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  // { key: 'taxes', label: 'Taxes', icon: <FileText size={20} /> },
];

export default function Sidebar() {
  const router = useRouter();
  const theme = useTheme();
  const { settingType } = router.query;
  console.log('Sidebar Log', router);

  return (
    <Box width={'100%'}>
      <Typography variant="h4" fontWeight={600}>
        Account Settings
      </Typography>

      <List>
        {sections.map((section) => (
          <Link key={section.key} href={`/account-settings?settingType=${section.key}`} passHref>
            <ListItem
              selected={section.key.startsWith(settingType)}
              sx={{
                bgcolor: section.key.startsWith(settingType) ? 'action.selected' : 'inherit',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                cursor: 'pointer',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'unset',
                  mr: { xs: 2, sm: 1, md: 2 },
                  color: 'text.primary',
                  '& svg': {
                    fontSize: { sm: '18px', md: '20px' },
                  },
                }}
              >
                {section.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: { sm: '0.85rem', md: '1rem' },
                      fontWeight: 500,
                    }}
                  >
                    {section.label}
                  </Typography>
                }
              />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
}
