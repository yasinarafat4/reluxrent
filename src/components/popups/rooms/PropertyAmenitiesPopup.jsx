import { useTranslation } from '@/contexts/TranslationContext';
import { Avatar, Box, capitalize, DialogTitle, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';

export default function PropertyAmenitiesPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();

  // Grouping by type
  const groupedAmenities = popupData.amenities.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  console.log('groupedAmenities', groupedAmenities);

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '10px', md: 0 },
          width: '100%',
          borderRadius: '15px',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} p={1}>
        <DialogTitle sx={{ fontSize: { xs: '16px', md: '20px', fontWeight: 600 } }}>{trans('What this place offers')}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={(theme) => ({
            color: theme.palette.text.primary,
          })}
        >
          <X />
        </IconButton>
      </Stack>
      <Divider />
      <DialogContent>
        <Stack gap={2}>
          {Object.entries(groupedAmenities).map(([resource, perms]) => (
            <Box key={resource}>
              <Typography variant="h5" mb={1}>
                {capitalize(resource)}
              </Typography>
              <Box>
                <List
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                    },
                    gap: 1,
                  }}
                >
                  {perms.map((item, i) => {
                    return (
                      <ListItem key={i} alignItems="center">
                        <ListItemAvatar>
                          <Avatar alt={item?.name} src={item?.icon} />
                        </ListItemAvatar>
                        <ListItemText primary={item?.name} />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
