/* eslint-disable import/no-anonymous-default-export */
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, ExportButton, List, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import { useLocation, useNavigate } from 'react-router-dom';
import WalletsListDesktop from './WalletsListDesktop';

const WalletsListActions = () => (
  <TopToolbar>
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const WalletsTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const WalletsList = () => {
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
        actions={<WalletsListActions />}
        title={<WalletsTitle />}
      >
        <WalletsListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: WalletsList,
};
