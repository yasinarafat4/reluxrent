import Toolbar from '@mui/material/Toolbar';
import { Fragment } from 'react';
import { DeleteWithConfirmButton, SaveButton, useNotify, useRecordContext, useRedirect } from 'react-admin';

const AmenitiesTypeEditToolbar = (props) => {
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
        <DeleteWithConfirmButton />
      </Fragment>
    </Toolbar>
  );
};

export default AmenitiesTypeEditToolbar;
