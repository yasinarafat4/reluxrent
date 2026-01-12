/* eslint-disable import/no-anonymous-default-export */
import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, ExportButton, List, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import FeesEdit from './FeesEdit';
import FeesListDesktop from './FeesListDesktop';

const FeesListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const FeesTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const FeesList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'guestFee', 'hostFee', 'moreThenSeven', 'lessThenSeven', 'hostPenalty', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Id',
      guestFee: 'Guest Service Charge (%)',
      hostFee: 'Host Service Charge (%)',
      moreThenSeven: 'Host Cancellation Fees More than 7 days before check-in',
      lessThenSeven: 'Host Cancellation Fees Less than 7 days before check-in',
      hostPenalty: 'Host Penalty',
      createdAt: 'Created At',
    },
    exportAll: true,
  });

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <List
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(['all'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
        actions={<FeesListActions />}
        title={<FeesTitle />}
        exporter={exporter}
      >
        <FeesListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: FeesList,
  edit: FeesEdit,
};
