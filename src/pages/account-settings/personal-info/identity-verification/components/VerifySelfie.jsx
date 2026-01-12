import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const VerifySelfie = ({ onBack, onSubmit }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraError, setCameraError] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setCameraError(true);
      }
    };
    enableCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const captureSelfie = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL('image/png'));
  };

  const handleSubmit = () => {
    if (capturedImage) {
      onSubmit?.(capturedImage);
    }
  };

  return (
    <Box width="100%" maxWidth={600} mx="auto" sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
      {/* Title Section */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Verify Your Identity
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Please upload or take a selfie to verify your identity. Ensure your face is well-lit and clearly visible.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Camera or Upload Section */}
        {!cameraError ? (
          <Box width={'100%'} mt={3} p={2} border="1px solid" borderColor="divider" borderRadius={2}>
            <Typography color="text.secondary" mb={2} textAlign="center">
              Continue on your phone for an easier experience.
            </Typography>
            <Stack direction="row" justifyContent="center" spacing={2} alignItems="center">
              <Box height={220} width={220}>
                <img src="/images/qr.png" alt="qr code" style={{ width: '100%' }} />
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Box textAlign={'center'}>
              <Typography fontSize={14}>Scan this QR code </Typography>
              <Typography component={Link} href="https://your-app-link.com/download" sx={{ textDecoration: 'underline' }} color="primary.main">
                Or click here to download.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
              We couldn't access your camera. Please upload a selfie or continue on your phone.
            </Typography>

            {/* Upload Box */}
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: '350px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                  }}
                />
                <canvas ref={canvasRef} hidden />
                <Button onClick={captureSelfie} fullWidth variant="contained" sx={{ mt: 2, textTransform: 'none' }}>
                  Capture Selfie
                </Button>
              </>
            ) : (
              <Stack spacing={2} alignItems="center">
                <Box position={'relative'} width={'100%'} height={300} border={'1px solid'} borderColor={'divider'} borderRadius={1}>
                  <Image src={capturedImage} fill style={{ objectFit: 'cover', borderRadius: '10px' }} alt="Passport Image" />
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" onClick={() => setCapturedImage(null)}>
                    Reupload
                  </Button>
                  <Button variant="contained" onClick={handleSubmit}>
                    Submit
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        )}

        {/* Back Button */}
        {onBack && (
          <Button onClick={onBack} fullWidth variant="text" sx={{ mt: 2 }}>
            Back
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default VerifySelfie;
