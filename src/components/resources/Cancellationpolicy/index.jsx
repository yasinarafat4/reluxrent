/* eslint-disable import/no-anonymous-default-export */
import { Box, useMediaQuery } from '@mui/material';
import { ColumnsButton, CreateButton, FilterButton, List, SearchInput, TopToolbar, useDefaultTitle, useListContext } from 'react-admin';
import CancellationPolicyCreate from './CancellationPolicyCreate';
import CancellationPolicyEdit from './CancellationPolicyEdit';
import CancellationPolicyListDesktop from './CancellationPolicyListDesktop';

const CancellationPolicyListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);
const CancellationPolicyFilters = [<SearchInput source="q" alwaysOn />];

const CancellationPolicyTitle = () => {
  const title = useDefaultTitle();
  const { defaultTitle } = useListContext();
  return (
    <>
      <title>{`${defaultTitle}-${title}`}</title>
      <span>{defaultTitle}</span>
    </>
  );
};

export const CancellationPolicyList = () => {
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  // const location = useLocation();
  // const navigate = useNavigate();

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
        filters={CancellationPolicyFilters}
        actions={<CancellationPolicyListActions />}
        title={<CancellationPolicyTitle />}
      >
        <CancellationPolicyListDesktop />
      </List>
    </Box>
  );
};

export default {
  list: CancellationPolicyList,
  create: CancellationPolicyCreate,
  edit: CancellationPolicyEdit,
};
