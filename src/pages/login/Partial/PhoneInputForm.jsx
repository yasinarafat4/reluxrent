'use client';
import PhoneInputField from '@/components/PhoneInputField';
import OtpPopup from '@/components/popups/OtpPopup';
import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const PhoneInputForm = () => {
  const { trans } = useTranslation();
  const { control, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const onSubmit = async (formData) => {
    console.log(formData);
    const formattedPhoneNumber = formData.phone.replace(/\s+/g, '');
    setLoading(true);
    try {
      // const res = await sendOtp(formattedPhoneNumber);
      console.log('res', res);
      if (res.ok) {
        setPhoneNumber(formattedPhoneNumber);
        setShowOtpPopup(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phone) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return res;
    } catch (error) {
      console.log('Error sending OTP:', error.message);
    }
  };

  function closeOtpModal() {
    setShowOtpPopup(false);
  }

  return (
    <div>
      {/* Popup */}
      {showOtpPopup && <OtpPopup closeModal={closeOtpModal} showModal={showOtpPopup} phoneNumber={phoneNumber} sendOtp={sendOtp} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: { xs: 0, md: 1 } }}>
          <PhoneInputField control={control} name="phone" label="Phone Number" />

          <Button fullWidth variant="contained" color="primary" type="submit" loading={loading} loadingPosition="start">
            {trans('Continue')}
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default PhoneInputForm;
