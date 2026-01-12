import AccountLayout from '@/components/layout/account/AccountLayout';
import { fetcher } from '@/lib/fetcher';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import ChooseIDTypePage from './components/ChooseIDType';
import GovernmentIDSection from './components/UploadDocument';
import VerifySelfie from './components/VerifySelfie';

const IdentityVerification = () => {
  const [step, setStep] = useState('uploadDocument');

  const { data: verificationData } = useSWR('/api/host/verifications-data', fetcher);
  console.log('verificationData', verificationData);

  useEffect(() => {
    if (verificationData == null) {
      setStep('uploadDocument');
    } else if (verificationData.userId && verificationData.documentType == null) {
      setStep('idType');
    } else if (verificationData.userId && verificationData.documentType) {
      setStep('verifySelfie');
    } 
  }, [verificationData]);
  console.log('>>>', verificationData);

  const renderStep = () => {
    if (step === 'uploadDocument') {
      return <GovernmentIDSection />;
    }

    if (step === 'idType') {
      return <ChooseIDTypePage verificationData={verificationData} />;
    }

    if (step === 'verifySelfie') {
      return <VerifySelfie />;
    }

    return null;
  };

  return (
    <AccountLayout>
      <Box width={'100%'} sx={{ padding: { xs: 2, md: 10 } }}>
        {renderStep()}
      </Box>
    </AccountLayout>
  );
};

export default IdentityVerification;
