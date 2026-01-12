import { usePopups } from '@/contexts/PopupContext';
import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Email, Facebook, Instagram, LinkedIn, LocationOn, Phone, WhatsApp, YouTube } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Container, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../../../../../public/images/logos/reluxrent.png';
export default function Footer() {
  const { trans, lang } = useTranslation();
  const { actions } = usePopups();
  const router = useRouter();
  const { activeCurrency } = useReluxRentAppContext();
  return (
    <Box
      component="footer"
      sx={{
        height: '100%',
        px: { xs: 1.5, sm: 3, xl: 0 },
        pt: 3,
        mb: { xs: router.pathname.startsWith('/rooms') ? 16 : 5, md: 0 },
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'common.white'),
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Top Section */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pb: 2,
        }}
      >
        {/* Background Watermark */}
        <Typography
          variant="h1"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: { xs: '4.9rem', sm: '8rem', md: '11rem', lg: '15rem', xl: '17.5rem' },
            fontWeight: 600,
            color: 'black',
            opacity: 0.04,
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {/* On mobile → vertical letters */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'inline' },
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {'RELUXRENT'.split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </Box>
        </Typography>

        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 4,
              justifyContent: 'space-between',
            }}
          >
            {/* Logo + Social */}
            <Box>
              <Stack spacing={0}>
                <Box display={'flex'} justifyContent={'start'}>
                  <Link href="/" passHref>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Image src={logo} alt="Logo" width={130} height={100} />
                    </Box>
                  </Link>
                </Box>
                <Typography variant="body2" fontWeight={400} color="text.secondary">
                  Wherever you go, there is always a place. With Reluxrent, you'll always feel at home.
                </Typography>
                <Stack direction="row" justifyContent={{ xs: 'center', sm: 'start' }} spacing={2} mt={2}>
                  <IconButton
                    LinkComponent={Link}
                    href="https://www.facebook.com/"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                      },
                    }}
                  >
                    <Facebook fontSize="16px" />
                  </IconButton>
                  <IconButton
                    LinkComponent={Link}
                    href="https://www.instagram.com/"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                      },
                    }}
                  >
                    <Instagram fontSize="16px" />
                  </IconButton>
                  <IconButton
                    LinkComponent={Link}
                    href="https://www.linkedin.com/"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                      },
                    }}
                  >
                    <LinkedIn fontSize="16px" />
                  </IconButton>
                  <IconButton
                    LinkComponent={Link}
                    href="https://www.youtube.com/"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                      },
                    }}
                  >
                    <YouTube fontSize="16px" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* Support */}
            <Box>
              <Typography variant="body1" fontSize={17} fontWeight={500} gutterBottom>
                {trans('Support')}
              </Typography>
              <Stack spacing={1}>
                <Link href="/help" className="text-[14px] hover:underline text-inherit">
                  {trans('Help Center')}
                </Link>
                <Link href="/help/about-us" className="text-[14px] hover:underline text-inherit">
                  {trans('About Us')}
                </Link>
                <Link href="/help/terms-and-conditions" className="text-[14px] hover:underline text-inherit">
                  {trans('Terms and Conditions')}
                </Link>
                <Link href="/help/refund-policy" className="text-[14px] hover:underline text-inherit">
                  {trans('Refund Policy')}
                </Link>
                <Link href="/help/privacy-polic" className="text-[14px] hover:underline text-inherit">
                  {trans('Privacy Policy')}
                </Link>
              </Stack>
            </Box>

            {/* Contact Us */}
            <Box>
              <Typography variant="body1" fontSize={17} fontWeight={500} gutterBottom>
                {trans('Contact us')}
              </Typography>
              {/* Address */}
              <Typography variant="body2" fontWeight={500} mb={1}>
                {trans('Address')}:
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <LocationOn sx={{ color: 'primary.main' }} fontSize="small" />
                <Typography variant="body2" color="text.primary">
                  Mirpur, Dhaka, Bangladesh.
                </Typography>
              </Stack>

              {/* Contact */}
              <Typography variant="body2" fontWeight={500} mb={1}>
                {trans('Contact')}:
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Phone sx={{ color: 'primary.main' }} fontSize="small" />
                <Typography variant="body2" color="text.primary">
                  {trans('Call us')} :{' '}
                  <Link href="tel:+8801234567890" sx={{ color: 'text.secondary' }}>
                    +8801234567890
                  </Link>
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Email sx={{ color: 'primary.main' }} fontSize="small" />
                <Typography variant="body2" color="text.primary">
                  {trans('Email')} :{' '}
                  <Link href="mailto:info@reluxrent.com" sx={{ color: 'text.secondary' }}>
                    info@reluxrent.com
                  </Link>
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Email sx={{ color: 'primary.main' }} fontSize="small" />
                <Typography variant="body2" color="text.primary">
                  {trans('Email')} :{' '}
                  <Link href="mailto:support@reluxrent.com" sx={{ color: 'text.secondary' }}>
                    support@reluxrent.com
                  </Link>
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <WhatsApp sx={{ color: 'primary.main' }} fontSize="small" />
                <Typography variant="body2" color="text.primary">
                  {trans('WhatsApp')} :{' '}
                  <Link href="https://wa.me/8801234567890" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary' }}>
                    +8801234567890
                  </Link>
                </Typography>
              </Stack>
            </Box>

            {/* Payments */}
            <Box>
              <Typography variant="body1" fontSize={17} fontWeight={500} gutterBottom>
                {trans('Accepted payments')}
              </Typography>
              <Box>
                <Image src={`/images/payments/SSLCommerz-payments-current.png`} height={175} width={360} objectFit="cover" alt="payment" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Bottom section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 'xl',
          borderTop: '1px solid',
          borderColor: 'divider',
          mx: 'auto',
          py: 2,
          gap: 2,
        }}
      >
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          © Copyright {new Date().getFullYear()} - {trans('All Rights Reserved by ReluxRent.')}
        </Typography>

        <Stack direction="row" gap={1.5} alignItems="center">
          <Stack onClick={() => actions.openPopup('languageAndCurrency', 'language')} direction="row" alignItems="center" sx={{ cursor: 'pointer' }}>
            <IconButton sx={{ p: 0.5, color: 'text.secondary' }} size="small">
              <LanguageIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">
              {lang.name} ({lang.code})
            </Typography>
          </Stack>

          <Stack onClick={() => actions.openPopup('languageAndCurrency', 'currency')} direction="row" alignItems="center" sx={{ cursor: 'pointer' }}>
            <IconButton sx={{ p: 0, color: 'text.secondary' }} size="small">
              <AttachMoneyIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">{activeCurrency.code}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
