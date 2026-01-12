import Toolbar from '@mui/material/Toolbar';
import { Fragment } from 'react';
import { SaveButton, useNotify, useRecordContext, useRedirect } from 'react-admin';

const FeesEditToolbar = (props) => {
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
        <SaveButton
          mutationOptions={{
            onSuccess: () => {
              notify('ra.notification.updated', {
                type: 'info',
                messageArgs: { smart_count: 1 },
                undoable: true,
              });
              redirect('list', 'bed-types');
            },
          }}
          type="button"
        />
      </Fragment>
    </Toolbar>
  );
};

export default FeesEditToolbar;
