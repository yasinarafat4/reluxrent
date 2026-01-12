import { useTranslation } from '@/contexts/TranslationContext';
import { DialogTitle, Divider, IconButton, Stack, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { X } from 'lucide-react';

export default function PropertyDescriptionPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  console.log('propertyDescription', popupData);

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
      maxWidth={'md'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pt={1.5} px={2}>
        <DialogTitle
          sx={{
            fontSize: {
              xs: '16px',
              md: '18px',
            },
            fontWeight: 600,
            '&.MuiDialogTitle-root': {
              padding: 0,
            },
          }}
        >
          {trans('More about this Property')}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={closeModal}
          sx={{
            color: 'text.primary',
            p: 0,
          }}
        >
          <X />
        </IconButton>
      </Stack>
      <DialogContent sx={{ p: 0 }}>
        <Stack>
          {/* Description  */}
          {popupData?.description && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.description }} className="editor-content px-4 pb-3" />
            </>
          )}

          {/* About Place  */}
          {popupData?.aboutPlace && (
            <>
              <Divider sx={{ fontWeight: 600, fontSize: '17px' }}>About Place</Divider>
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.aboutPlace }} className="editor-content px-4 pb-3" />
            </>
          )}

          {/* Place is great for  */}
          {popupData?.placeIsGreatFor && (
            <>
              <Divider sx={{ fontWeight: 600, fontSize: '17px' }}>Place is Great for</Divider>
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.placeIsGreatFor }} className="editor-content px-4 pb-3" />
            </>
          )}

          {/* Guest Access  */}
          {popupData?.guestCanAccess && (
            <>
              <Divider sx={{ fontWeight: 600, fontSize: '17px' }}>Guest Access</Divider>
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.guestCanAccess }} className="editor-content px-4 pb-3" />
            </>
          )}

          {/* Interaction with Guests  */}
          {popupData?.interactionGuests && (
            <>
              <Divider sx={{ fontWeight: 600, fontSize: '17px' }}>Interaction with Guests</Divider>
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.interactionGuests }} className="editor-content px-4 pb-3" />
            </>
          )}

          {/* About Neighborhood */}
          {popupData?.aboutNeighborhood && (
            <>
              <Divider sx={{ fontWeight: 600, fontSize: '17px' }}>About Neighborhood</Divider>
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.aboutNeighborhood }} className="editor-content px-4 pb-3" />
            </>
          )}

          {/* Getting Around */}
          {popupData?.getAround && (
            <>
              <Divider sx={{ fontWeight: 600, fontSize: '17px' }}>Getting Around</Divider>
              <Typography component="div" dangerouslySetInnerHTML={{ __html: popupData?.getAround }} className="editor-content px-4 pb-3" />
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
