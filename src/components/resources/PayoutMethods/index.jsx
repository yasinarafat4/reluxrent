/* eslint-disable import/no-anonymous-default-export */
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, List, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import PayoutMethodsListDesktop from './PayoutMethodsListDesktop';

const PayoutMethodsListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);

const PayoutMethodsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const PayoutMethodsList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

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
        actions={<PayoutMethodsListActions />}
        title={<PayoutMethodsTitle />}
      >
        <PayoutMethodsListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: PayoutMethodsList,
};
