import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { fetcher } from '@/lib/fetcher';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tab from '@mui/material/Tab';
import { X } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';

export default function LanguageAndCurrencyPopup({ closeModal, showModal, popupData }) {
  const { lang, setLang, trans } = useTranslation();
  const { activeCurrency, allCurrency, setCurrency } = useReluxRentAppContext();
  const [activeTab, setActiveTab] = useState(popupData);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { data: languageData = [] } = useSWR(`/api/front/languages`, fetcher);

  return (
    <Dialog disableScrollLock open={showModal} fullWidth={true} maxWidth={'lg'} onClose={closeModal} aria-labelledby="responsive-dialog-title" sx={{ zIndex: '99999' }}>
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={(theme) => ({
          position: 'absolute',
          padding: { xs: '1px', md: '5px' },
          right: 8,
          top: 8,
          zIndex: '9999',
          color: theme.palette.grey[700],
        })}
      >
        <X />
      </IconButton>
      <DialogContent sx={{ padding: { xs: '15px', md: '25px' } }}>
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                <Tab label="Language" value="language" />
                <Tab label="Currency" value="currency" />
              </TabList>
            </Box>

            {/* Language Panel */}
            <TabPanel sx={{ padding: '0px' }} value="language">
              <Box
                sx={[
                  (theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    bgcolor: theme.palette.background.default,
                    px: { xs: 1, sm: 3 },
                    py: { xs: 1, sm: 2 },
                    width: { xs: '100%', sm: '50%' },
                    borderRadius: 2,
                    my: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  }),
                  (theme) =>
                    theme.applyStyles?.('dark', {
                      bgcolor: theme.palette.grey[900],
                      borderColor: theme.palette.grey[700],
                    }),
                ]}
              >
                <Typography variant="body2" color="text.secondary">
                  {trans('Active language')}:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="text.primary">
                  {lang.name} - {lang.code}
                </Typography>
              </Box>

              <DialogTitle sx={{ fontSize: { xs: '15px', md: '18px' }, padding: { xs: '10px 0px', md: '15px 0px' } }} id="responsive-dialog-title">
                {trans('Choose a language and region')}
              </DialogTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 justify-center items-center gap-3">
                {languageData.map((option, i) => (
                  <div
                    key={i}
                    onClick={() => setLang(option)}
                    className={`cursor-pointer border rounded-xl py-2 px-4 text-start transition ${lang.code === option.code ? 'border-2 border-primary shadow-lg' : 'border-slate-300 hover:border-slate-500'}`}
                  >
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.code}
                    </Typography>
                  </div>
                ))}
              </div>
            </TabPanel>

            {/* Currency Panel */}
            <TabPanel sx={{ padding: '0px' }} value="currency">
              <Box
                sx={[
                  (theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    bgcolor: theme.palette.background.default,
                    px: { xs: 1, sm: 3 },
                    py: { xs: 1, sm: 2 },
                    width: { xs: '100%', sm: '50%' },
                    borderRadius: 2,
                    my: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  }),
                  (theme) =>
                    theme.applyStyles?.('dark', {
                      bgcolor: theme.palette.grey[900],
                      borderColor: theme.palette.grey[700],
                    }),
                ]}
              >
                <Typography variant="body2" color="text.secondary">
                  {trans('Active currency')}:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="text.primary">
                  {activeCurrency.code}-{activeCurrency.symbol}
                </Typography>
              </Box>

              <DialogTitle sx={{ fontSize: { xs: '15px', md: '18px' }, padding: { xs: '10px 0px', md: '15px 0px' } }} id="responsive-dialog-title">
                {trans('Choose a currency')}
              </DialogTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 justify-center items-center gap-3">
                {allCurrency.map((option, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrency(option)}
                    className={`cursor-pointer border rounded-xl py-2 px-4 text-start transition ${activeCurrency.code === option.code ? 'border-2 border-primary shadow-lg' : 'border-slate-300 hover:border-slate-500'}`}
                  >
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.code}-{option.symbol}
                    </Typography>
                  </div>
                ))}
              </div>
            </TabPanel>
          </TabContext>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
