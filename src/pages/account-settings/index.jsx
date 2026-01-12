import AccountLayout from '@/components/layout/account/AccountLayout';
import { useAuth } from '@/contexts/authContext';
import { Box, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import LoginAndSecurity from './login-and-security';
import PaymentsPage from './payments';
import PersonalInfoPage from './personal-info';

const index = () => {
  const router = useRouter();
  const { settingType } = router.query;
  const { user } = useAuth();
  const isXs = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <AccountLayout>
      <Box width={{ xs: '100%', sm: 500 }} mx={'auto'}>
        {isXs && settingType ? (
          <>
            {settingType == 'personal-info' ? (
              <PersonalInfoPage sessionUser={user} />
            ) : settingType == 'login-and-security' ? (
              <LoginAndSecurity sessionUser={user} />
            ) : settingType == 'payments' ? (
              <PaymentsPage />
            ) : (
              ''
            )}
          </>
        ) : (
          <Sidebar />
        )}
      </Box>
      {!isXs && (
        <Box width={{ xs: '100%' }} mx={'auto'}>
          {settingType == 'personal-info' ? (
            <PersonalInfoPage sessionUser={user} />
          ) : settingType == 'login-and-security' ? (
            <LoginAndSecurity sessionUser={user} />
          ) : settingType == 'payments' ? (
            <PaymentsPage />
          ) : (
            <PersonalInfoPage sessionUser={user} />
          )}
        </Box>
      )}
    </AccountLayout>
  );
};

export default index;
