import { DataTable, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

export const WalletsListDesktop = () => {
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
    ></Table>
  );
};

export default WalletsListDesktop;
