import PhoneInputField from '@/components/PhoneInputField';
import OtpPopup from '@/components/popups/OtpPopup';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const PhoneNumber = ({ editingKey, setEditingKey, data }) => {
  const { trans } = useTranslation();
  const [showOtpPopup, setShowOtpPopup] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log('Phone Data:', data);
    setEditingKey(null);
  };

  // Mask (***) Phone Number
  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 8) return phone;

    // Match country code
    const match = phone.match(/^(\+\d{1,4})/);
    const countryCode = match ? match[1] : '';
    const localPart = phone.replace(countryCode, '');

    const last4 = localPart.slice(-4);
    return `${countryCode} ****-**${last4}`;
  };

  // Modal Handelers
  function handelShowModal(field) {
    if (field == 'otpPopup') {
      setShowOtpPopup(true);
    }
  }

  function closeOtpModal() {
    setShowOtpPopup(false);
  }

  return (
    <Box py={1}>
      {/* Popup */}
      {showOtpPopup && <OtpPopup closeModal={closeOtpModal} showModal={showOtpPopup} />}

      <Typography variant="subtitle2" fontWeight={600}>
        {trans('Phone number')}
      </Typography>

      {editingKey === 'phoneNumber' && (
        <Typography variant="body2" color="text.secondary">
          {trans('For notifications, reminders, and help logging in')}
        </Typography>
      )}

      {editingKey === 'phoneNumber' ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <PhoneInputField control={control} disabled={user?.provider == 'phone'} needVerify={user?.provider != 'phone'} handelShowModal={handelShowModal} name="phone" label={trans('Phone Number')} /> */}
          <PhoneInputField control={control} name="phone" label={trans('Phone number')} />

          <Box mt={1} display="flex" gap={1}>
            <Button sx={{ textTransform: 'none' }} onClick={() => handelShowModal('otpPopup')} variant="contained" size="small" type="submit">
              {trans('Verify')}
            </Button>
            <Button
              sx={{ textTransform: 'none' }}
              variant="outlined"
              size="small"
              onClick={() => {
                setEditingKey(null);
              }}
            >
              {trans('Cancel')}
            </Button>
          </Box>
        </form>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            {data ? maskPhoneNumber(data) : trans('Not added')}
          </Typography>

          <Button
            sx={{
              textTransform: 'none',
              bgcolor: 'transparent',
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            variant="text"
            size="small"
            onClick={() => setEditingKey('phoneNumber')}
          >
            {trans('Edit')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PhoneNumber;
