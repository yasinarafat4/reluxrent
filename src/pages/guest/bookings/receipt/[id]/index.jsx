import GuestLayout from '@/components/layout/guest/GuestLayout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Button, Stack, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../../../../../../public/images/logos/reluxrent-logo.png';

const Receipt = () => {
  const router = useRouter();
  const { id } = router.query;

  console.log();

  return (
    <GuestLayout>
      <Box width={{ xs: '100%', lg: '80%', xl: '65%' }} mx="auto" px={2} pt={{ md: 2 }} pb={{ xs: 10, md: 2 }}>
        <Stack direction={'row'} alignItems={'center'} gap={1} mb={1}>
          <Box component={Link} href={'/guest/bookings?type=home&status=All'}>
            <ArrowLeft size={20} />
          </Box>
          <Typography color="success.main" fontWeight="bold">
            Receipt #65
          </Typography>
        </Stack>
        <Box
          sx={{
            backgroundColor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
          }}
        >
          <Stack
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              p: 2,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography fontWeight="bold">Customer Receipt</Typography>
            <Typography fontWeight="bold">
              Confirmation Code: <span style={{ color: '#666' }}>YrWT06</span>
            </Typography>
          </Stack>

          <Stack gap={2} p={2}>
            <Stack gap={2} alignItems="start">
              <Box sx={{ width: '100%' }}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Link href="/" passHref>
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Image src={logo} alt="Logo" width={180} height={70} />
                    </Box>
                  </Link>
                  <Box>
                    <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />}>
                      PDF
                    </Button>
                  </Box>
                </Stack>
              </Box>
              <Box item xs>
                <Typography mt={1}>
                  <strong>Name:</strong> John Doe
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0,
                p: 2,
              }}
            >
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                gap={2} // spacing between items
              >
                {/* Accommodation Address */}
                <Box>
                  <Typography fontWeight="bold">Accommodation Address</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dorm in Thailand <br />
                    401/12 ลัยลบลาภพะรังจอใหม่ หมู่ที่ 2 ตำบลบงมะพระ <br />
                    Tambon Nong Choeng, Amphoe Bueng Sam Phan, Chang Wat Phetchabun 67160, Thailand
                  </Typography>
                </Box>

                {/* Travel Destination */}
                <Box>
                  <Typography fontWeight="bold">Travel Destination</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tambon Nong Choeng
                    <br />
                    <strong>Accommodation Host:</strong> Albert Stephen
                  </Typography>
                </Box>

                {/* Duration */}
                <Box>
                  <Typography fontWeight="bold">Duration</Typography>
                  <Typography variant="body2" color="text.secondary">
                    2 Nights
                    <br />
                    <strong>Check In:</strong> Thu, August 10, 2023
                    <br />
                    <CheckCircleOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Check in after: 6AM
                  </Typography>
                </Box>

                {/* Accommodation Type */}
                <Box>
                  <Typography fontWeight="bold">Accommodation Type</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dorm
                    <br />
                    <strong>Check Out:</strong> Sat, August 12, 2023
                    <br />
                    <CheckCircleOutlineIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Check out before: 11PM
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography fontWeight="bold" bgcolor="grey.900" color="white" p={1.5} borderRadius={0}>
                Booking Charges
              </Typography>

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>10-08-2023</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }} align="right">
                      $20
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>11-08-2023</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }} align="right">
                      $20
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>$20 x 2 Nights</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }} align="right">
                      $40
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>I.V.A Tax</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }} align="right">
                      $2
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>Accommodation Tax</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }} align="right">
                      $2
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>Buy2Rental Service Fee</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }} align="right">
                      $2
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider', fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider', fontWeight: 'bold' }} align="right">
                      $46
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Box display="flex" justifyContent="flex-end" p={1.5}>
                <Typography fontWeight="bold">
                  <PaymentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Payment Received: $46
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </GuestLayout>
  );
};

export default Receipt;
