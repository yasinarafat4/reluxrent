import { Box, Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function Error() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 6,
        px: 3,
      }}
    >
      {/* Left Side - Text */}
      <Box sx={{ maxWidth: 400 }}>
        <Typography variant="h1" sx={{ fontWeight: 700, fontSize: { xs: 64, md: 96 }, lineHeight: 1 }} mb={4}>
          Oops!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          We can't seem to find the page you're looking for.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
          Error code: 404
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Here are some helpful links instead:
        </Typography>

        <Stack spacing={1}>
          <Link href="/" passHref>
            <Button variant="text"  sx={{ textTransform: 'none', color: 'primary.main' }}>
              Home
            </Button>
          </Link>
          <Link href="/help" passHref>
            <Button variant="text" sx={{ textTransform: 'none', color: 'primary.main' }}>
              Help
            </Button>
          </Link>
        </Stack>
      </Box>

      {/* Right Side - Illustration */}
      <Box sx={{ width: { xs: 250, md: 350 } }}>
        <Image
          src="/images/error.png"
          alt="404 Illustration"
          width={350}
          height={350}
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
    </Box>
  );
}
