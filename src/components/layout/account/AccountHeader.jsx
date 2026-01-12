'use client';

import LightDarkSwitcher from '@/components/LightDarkSwitcher';
import { AppBar, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../../public/images/logos/reluxrent.png';

export default function AccountHeader() {
  return (
    <AppBar
      sx={{
        bgcolor: 'background.primary',
        color: 'text.primary',
        boxShadow: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <div className="relative flex w-full h-full justify-between py-2 px-4 md:px-6 md:py-2 transition-all duration-300 ease-in-out">
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={{ xs: '100%' }}>
          <Link href="/" className="flex items-center">
            <Image width={100} height={50} src={logo} alt="Logo" />
          </Link>
          {/* Dark & Light Mode Icons */}
          <Box>
            <LightDarkSwitcher />
          </Box>
        </Stack>
      </div>
    </AppBar>
  );
}
