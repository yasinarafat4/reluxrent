import { useAuth } from '@/contexts/authContext';
import { usePopups } from '@/contexts/PopupContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ChevronsRight, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function BecomeHostPopup({ closeModal, showModal, popupData }) {
  const { trans } = useTranslation();
  const { user } = useAuth();
  const { actions } = usePopups();

  const [selectedOption, setSelectedOption] = useState('home');

  const router = useRouter();

  const options = [
    { key: 'home', label: trans('Home'), emoji: '🏠' },
    { key: 'experience', label: trans('Experience'), emoji: '🎈' },
  ];

  const onNextClick = () => {
    if (user) {
      if (selectedOption === 'home') {
        router.push('/host/property/create');
      } else {
        router.push('/host/experience');
      }
    } else {
      actions.openPopup('login', {});
    }
    actions.closePopup('becomeHost');
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          margin: '10px',
          flexDirection: 'column',
          width: '100%',
        },
      }}
      disableScrollLock
      open={showModal}
      fullWidth={true}
      maxWidth={'sm'}
      onClose={closeModal}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle sx={{ fontSize: { xs: '16px', md: '18px' }, padding: { xs: 2, md: 3 } }} id="responsive-dialog-title">
        {trans('What would you like to host?')}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[700],
        })}
      >
        <X />
      </IconButton>
      <DialogContent sx={{ padding: { xs: '0 15px', md: '0 25px' } }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option) => (
            <div
              key={option.key}
              onClick={() => setSelectedOption(option.key)}
              className={`cursor-pointer border rounded-xl p-6 text-center transition ${selectedOption === option.key ? 'border-primary shadow-lg' : 'border-slate-300 hover:border-slate-500'}`}
            >
              <div className="text-5xl mb-4">{option.emoji}</div>
              <div className="text-base font-medium">{option.label}</div>
            </div>
          ))}
        </div>
      </DialogContent>

      <DialogActions sx={{ padding: { xs: '15px', md: '25px' } }}>
        <Button onClick={() => onNextClick()} disabled={!selectedOption} variant="contained" endIcon={<ChevronsRight />}>
          {trans('Next')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
