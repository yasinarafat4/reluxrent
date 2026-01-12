import { useTranslation } from '@/contexts/TranslationContext';
import { Box, Divider, Typography } from '@mui/material';
import { MoveLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Address from './partials/Address';
import EmailAddress from './partials/EmailAddress';
import EmergencyContact from './partials/EmergencyContact';
import IdentityVerification from './partials/IdentityVerification';
import InfoCardList from './partials/InfoCardList';
import LegalName from './partials/LegalName';
import PhoneNumber from './partials/PhoneNumber';
import PreferredName from './partials/PreferredName';

export default function PersonalInfoPage({ sessionUser }) {
  const { trans } = useTranslation();
  const [editingKey, setEditingKey] = useState(null);

  return (
    <Box width={'100%'}>
      <Box component={Link} href="/account-settings" color={'text.primary'} sx={{ p: 0, display: { sm: 'none' } }}>
        <MoveLeft size={40} />
      </Box>
      <Typography variant="h4" fontWeight={600}>
        {trans('Personal information')}
      </Typography>

      <Box mt={2}>
        {/* Legal Name */}
        <LegalName editingKey={editingKey} setEditingKey={setEditingKey} data={sessionUser?.name} />
        <Divider />

        {/* Preferred Name */}
        <PreferredName editingKey={editingKey} setEditingKey={setEditingKey} data={sessionUser?.preferredName} />
        <Divider />

        {/* Email Address */}
        <EmailAddress editingKey={editingKey} setEditingKey={setEditingKey} data={sessionUser?.email} />
        <Divider />

        {/* Phone Number */}
        <PhoneNumber editingKey={editingKey} setEditingKey={setEditingKey} data={sessionUser?.phone} />
        <Divider />

        {/* Identity Verification */}
        <IdentityVerification editingKey={editingKey} setEditingKey={setEditingKey} />
        <Divider />

        {/* Address */}
        <Address editingKey={editingKey} setEditingKey={setEditingKey} />
        <Divider />

        {/* Emergency Contact */}
        <EmergencyContact editingKey={editingKey} setEditingKey={setEditingKey} />
        <Divider />

        {/* Info Card */}
        <InfoCardList />
      </Box>
    </Box>
  );
}
