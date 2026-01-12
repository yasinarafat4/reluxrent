import { Stack } from '@mui/material';
import { BulkDeleteButton, DataTable, DateField, DeleteButton, EditButton, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

export const CancellationPolicyListDesktop = () => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const CancellationPolicyBulkActionButtons = () => (
    <>
      {/* <BulkAcceptButton />
      <BulkRejectButton /> */}
      <BulkDeleteButton />
    </>
  );

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      rowClick={false}
      bulkActionButtons={<CancellationPolicyBulkActionButtons />}
      sx={{
        '& .RaDataTable-thead': {
          borderLeftColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
        },
      }}
    >
      <Column source="id" field={TextField} />
      <Column source="translations.en.name" field={TextField} label="Name (EN)" disableSort={true} />
      <Column source="beforeDays" field={TextField} label="Before Days" />
      <Column source="beforeDayPriorRefund" field={TextField} label="Before the day Prior Refund (%)" />
      <Column source="afterDayPriorRefund" field={TextField} label="After the day Prior Refund (%)" />
      <Column source="createdAt" field={DateField} />
      <Column>
        <Stack direction={'row'} gap={1}>
          <EditButton />
          <DeleteButton mutationMode="pessimistic" />
        </Stack>
      </Column>
    </Table>
  );
};

export default CancellationPolicyListDesktop;
