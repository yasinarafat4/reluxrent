import { useTranslation } from '@/contexts/TranslationContext';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Users } from 'lucide-react';
import Link from 'next/link';

export default function BookingTermsPopup({ closeModal, showModal }) {
  const { trans } = useTranslation();

  const terms = [
    {
      title: "Host's house rules",
      content: (
        <Box sx={{ fontSize: '14px', color: 'text.primary' }}>
          <Typography variant="caption">You'll be staying in someone's home, so please treat it with care and respect.</Typography>

          <Typography variant="subtitle2" mt={2} fontWeight={600} gutterBottom>
            During your stay
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Users size={15} />
            <Typography variant="caption">4 guests maximum</Typography>
          </Box>
        </Box>
      ),
    },
    {
      title: "Reluxrent's ground rules for guests",
      route: '/ground-rules',
    },
    {
      title: "Reluxrent's rebooking and refund policy",
      content: (
        <Box sx={{ fontSize: '14px', color: 'text.primary' }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
            If a Host cancels your reservation prior to check-in, you will automatically receive a full refund. If a Host cancels 30 days or less prior to check-in, and you contact us, we will also
            assist you with finding comparable or better accommodations.
          </Typography>

          <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
            Other Travel Issues must be reported to us no later than 72 hours after discovery. If we determine that a Travel Issue has disrupted the stay, we will provide a full or partial refund and,
            depending on the circumstances, may assist the guest with finding comparable or better accommodations. The amount of any refund will depend on the severity of the Travel Issue, the impact
            on you, the portion of the stay affected, and whether you remain at the accommodations.
          </Typography>

          <Link href="#" className="underline">
            Read the full terms
          </Link>
        </Box>
      ),
    },
    {
      title: 'Getting charged for damage',
      content: (
        <Box sx={{ fontSize: '10px' }}>
          <Typography variant="caption" mb={1}>
            Accidents are rare, but they happen. If you, someone you invite, or a pet are responsible for damage during a stay, your payment method may be charged.
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            What can I be charged for?
          </Typography>
          <Typography variant="caption" mb={1}>
            You could be charged for damage, any of your Host's stuff that goes missing, or unexpected cleaning costs due to your stay.
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            What's the process?
          </Typography>
          <Typography variant="caption" mb={1}>
            If you and your Host can't work it out first, we'll step in to determine responsibility. We'll only charge your payment method if we have reason to believe you're responsible.
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            What if I don't agree?
          </Typography>
          <Typography variant="caption">You'll have a chance to appeal if you think we made a mistake.</Typography>
        </Box>
      ),
    },
  ];

  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      disableScrollLock
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          m: { xs: 1, sm: 0 },
        },
      }}
    >
      <DialogContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Booking terms
          </Typography>
          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Accordion List */}
        <Box mt={1}>
          {terms.map((term, index) => {
            if (term.route) {
              return (
                <Box
                  key={index}
                  component={Link}
                  href={term.route}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    },
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={500}>
                    {term.title}
                  </Typography>
                  <ExpandMoreIcon sx={{ color: 'text.primary' }} />
                </Box>
              );
            }

            return (
              <Accordion key={index} disableGutters elevation={0} sx={{ boxShadow: 'none', borderBottom: '1px solid #eee' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />} aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
                  <Typography variant="subtitle2" fontWeight={500}>
                    {term.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>{term.content}</AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
