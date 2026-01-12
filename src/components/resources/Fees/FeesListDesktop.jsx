import { DataTable, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

export const FeesListDesktop = () => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={false}
      sx={{
        '& .RaDataTable-thead': {
          borderLeftColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
        },
      }}
    >
      <Column source="guestFee" field={TextField} label="Guest service charge (%)" />
      <Column source="hostFee" field={TextField} label="Host service charge (%) " />
      <Column source="moreThenSeven" field={TextField} label="Host Cancellation Fees More than 7 days before check-in " />
      <Column source="lessThenSeven" field={TextField} label="Host Cancellation Fees Less than 7 days before check-in" />
      <Column source="hostPenalty" field={TextField} label="Host Penalty " />
    </Table>
  );
};

export default FeesListDesktop;
