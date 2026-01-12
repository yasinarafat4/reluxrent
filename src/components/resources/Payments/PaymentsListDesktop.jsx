import { green, orange, red } from '@mui/material/colors';
import { DataTable, DateField, NumberField, ReferenceField, TextField, useCreatePath } from 'react-admin';
import { useNavigate } from 'react-router';

const rowSx = () => (record) => {
  let style = {};

  if (!record) {
    return style;
  }

  // Apply border styles based on the status
  if (record.status === 'PAID') {
    return {
      ...style,
      borderLeftColor: green[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (record.status === 'PENDING') {
    return {
      ...style,
      borderLeftColor: orange[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  if (['EXPIRED', 'UNATTEMPTED', 'FAILED', 'CANCELLED'].includes(record.status)) {
    return {
      ...style,
      borderLeftColor: red[500],
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
    };
  }

  return style;
};

export const PaymentsListDesktop = ({ setPaymentId, setIsDrawerOpen }) => {
  const navigate = useNavigate();
  const createPath = useCreatePath();

  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      bulkActionButtons={false}
      rowSx={rowSx()}
      rowClick={(id) => {
        setPaymentId(id);
        setIsDrawerOpen(true);
        // Disable the default rowClick
        return false;
      }}
    >
      {/* ID */}
      <Column source="id" field={TextField} label="ID" />

      <Column source="userId" label="User">
        <ReferenceField source="userId" reference="users">
          <TextField source="name" />
        </ReferenceField>
      </Column>

      {/* Booking ID */}
      <Column source="bookingId" label="Booking ID">
        <ReferenceField source="bookingId" reference="bookings">
          <TextField source="id" />
        </ReferenceField>
      </Column>

      {/* Transaction ID */}
      <Column source="transactionId" label="Transaction ID" field={TextField} />

      {/* Status  */}
      <Column
        source="status"
        render={(record) => (
          <span
            style={{
              color: record.status == 'PAID' ? 'green' : record.status == 'PENDING' ? 'orange' : 'red',
              fontWeight: 'bold',
            }}
          >
            {record.status}
          </span>
        )}
        label="Payment Status"
      />

      {/* Amount */}
      <Column source="amount" label="Payment Amount">
        <NumberField source="amount" label="Payment Amount" options={{ style: 'currency', currency: 'BDT' }} />
      </Column>

      {/* Transaction Date */}
      <Column source="transactionDate" label="Transaction Date">
        <DateField
          source="transactionDate"
          showTime
          options={{
            hourCycle: 'h12',
          }}
        />
      </Column>

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
  );
};

export default PaymentsListDesktop;
