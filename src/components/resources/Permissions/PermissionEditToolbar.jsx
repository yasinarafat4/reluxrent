import Toolbar from '@mui/material/Toolbar';
import { Fragment } from 'react';
import { DeleteButton, SaveButton, useNotify, useRecordContext, useRedirect } from 'react-admin';

const PermissionEditToolbar = (props) => {
  const { resource } = props;
  const redirect = useRedirect();
  const notify = useNotify();

  const record = useRecordContext();

  if (!record) return null;
  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        minHeight: { sm: '64px' },
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      }}
    >
      <Fragment>
        <SaveButton />
        <DeleteButton record={record} resource={resource} mutationMode="pessimistic" />
      </Fragment>
    </Toolbar>
  );
};

export default PermissionEditToolbar;
