import { useAdvancedXlsxExporter } from '@/exporters/useAdvancedXlsxExporter';
import { Box } from '@mui/material';
import { ColumnsButton, DataTable, DateField, ExportButton, FilterButton, List, SearchInput, SelectInput, TextField, TopToolbar, useRecordContext } from 'react-admin';

const UserPayoutMethodsActions = () => (
  <TopToolbar>
    <FilterButton />
    <ColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const UserPayoutMethodsFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="isDefault"
    label="Filter Default"
    choices={[
      { id: true, name: 'Default' },
      { id: false, name: 'Not default' },
    ]}
    optionText={(choice) => (
      <>
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            borderRadius: 4,
            mr: 1,
            display: 'inline-block',
          }}
        />
        {choice.name}
      </>
    )}
  />,
];

const UserPayoutMethods = () => {
  const record = useRecordContext();
  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

  const exporter = useAdvancedXlsxExporter({
    sortBy: 'createdAt',
    order: ['id', 'method', 'bankName', 'accountHolder', 'accNumber', 'swiftCode', 'branchName', 'branchCity', 'payoutAmount', 'isDefault', 'createdAt'],
    ignore: [],
    headers: {
      id: 'Id',
      method: 'Payout Method',
      bankName: 'Bank Name',
      accountHolder: 'Account Holder',
      accNumber: 'Account Number',
      swiftCode: 'Swift Code',
      branchName: 'Branch Name',
      branchCity: 'Branch City',
      payoutAmount: 'Payout Amount',
      isDefault: 'Is Default',
      createdAt: 'Created At',
    },
    format: { payoutAmount: '৳#,##0.00' },
    columnWidths: {
      payoutAmount: 20,
    },
    exportAll: true,
  });

  return (
    <List resource="payout-methods" filter={{ userId: userId }} filters={UserPayoutMethodsFilters} actions={<UserPayoutMethodsActions />} exporter={exporter}>
      <Table bulkActionButtons={false} rowClick={false}>
        {/* ID */}
        <Column source="id" field={TextField} label="ID" />

        {/* Payout Method */}
        <Column source="method" field={TextField} label="Payout Method" disableSort={true} />

        {/* Bank Name */}
        <Column source="bankName" field={TextField} label="Bank Name" />

        {/* Account Holder */}
        <Column source="accountHolder" field={TextField} label="Account Holder" />

        {/* Account Number */}
        <Column source="accNumber" field={TextField} label="Account Number" disableSort={true} />

        {/* Swift Code */}
        <Column source="swiftCode" field={TextField} label="Swift Code" disableSort={true} />

        {/* Branch Name */}
        <Column source="branchName" field={TextField} label="Branch Name" disableSort={true} />

        {/* Branch City */}
        <Column source="branchCity" field={TextField} label="Branch City" disableSort={true} />

        {/* Payout Amount */}
        <Column source="payoutAmount" field={TextField} label="Minimum Payout Amount" disableSort={true} />

        {/* Is Default */}
        <Column
          source="isDefault"
          render={(record) => (
            <span
              style={{
                color: record.isDefault ? 'green' : 'orange',
                fontWeight: 'bold',
              }}
            >
              {record.isDefault ? 'Default' : 'Not Default'}
            </span>
          )}
          label="Default"
        />

        {/* Created At */}
        <Column source="createdAt" label="Created At">
          <DateField
            source="createdAt"
            showTime
            options={{
              hourCycle: 'h12',
            }}
          />
        </Column>
      </Table>
    </List>
  );
};

export default UserPayoutMethods;
