import { Chip, Stack, Typography } from '@mui/material';
import { DataTable, DateField, FunctionField, ReferenceField, ShowButton, TextField, useRecordContext } from 'react-admin';
import rowSx from './rowSx';

const GuestCounts = () => {
  const record = useRecordContext();
  if (!record) return null;

  const { guests } = record;
  if (!guests) return null;

  const parts = [];

  if (guests.adults) {
    parts.push(`${guests.adults} Adult${guests.adults > 1 ? 's' : ''}`);
  }
  if (guests.children) {
    parts.push(`${guests.children} Child${guests.children > 1 ? 'ren' : ''}`);
  }
  if (guests.infants) {
    parts.push(`${guests.infants} Infant${guests.infants > 1 ? 's' : ''}`);
  }

  return <span>{parts.join(', ')}</span>;
};

export const BookingListDesktop = () => {
  const Table = DataTable;
  const Column = DataTable.Col;

  return (
    <Table
      rowClick={() => {
        return false;
      }}
      rowSx={rowSx()}
      sx={{
        '& .RaDataTable-thead': {
          borderLeftColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftStyle: 'solid',
        },
      }}
    >
      {/* Id */}
      <Column source="id" field={TextField} />

      {/* Host */}
      <Column source="host.id" label="Host">
        <ReferenceField source="host.id" reference="users">
          <TextField source="name" />
        </ReferenceField>
      </Column>

      {/* Guest */}
      <Column source="guest.id" label="Guest">
        <Stack>
          <ReferenceField source="guest.id" reference="users">
            <TextField source="name" />
          </ReferenceField>
          <Stack direction="row" gap={0.5}>
            <GuestCounts />
          </Stack>
        </Stack>
      </Column>

      {/* Check-in */}
      <Column source="startDate" field={DateField} label="Check-in" />

      {/* Checkout */}
      <Column source="endDate" field={DateField} label="Checkout" />

      {/* Booked at */}
      <Column source="confirmedAt" label="Booked at">
        <FunctionField
          render={(record) =>
            record.confirmedAt ? (
              <Stack>
                <DateField record={record} source="confirmedAt" />
                <DateField record={record} source="confirmedAt" showTime showDate={false} options={{ hourCycle: 'h12' }} />
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Not confirmed yet!
              </Typography>
            )
          }
        />
      </Column>

      {/* Listing */}
      <Column source="propertyId" label="Listing">
        <ReferenceField source="propertyId" reference="properties">
          <TextField source="translations.en.name" />
        </ReferenceField>
      </Column>

      {/* Confirmation Code */}
      <Column label="Confirmation Code" disableSort>
        <FunctionField
          render={(record) =>
            record.confirmationCode ? (
              <Typography variant="body2" fontWeight={500}>
                {record.confirmationCode}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Not assigned!
              </Typography>
            )
          }
        />
      </Column>

      {/* Total Amount */}
      <Column source="totalPrice" label="Total Amount" disableSort={true}>
        <FunctionField source="totalPrice" render={(record) => `${record.currency.symbol} ${record.grandTotal}`} />
      </Column>

      {/* Booking Status */}
      <Column source="bookingStatus" label="Booking Status">
        <FunctionField
          render={(record) => {
            const status = record.bookingStatus;
            let color = 'default';

            switch (status) {
              case 'PENDING':
                color = 'warning';
                break;
              case 'ACCEPTED':
                color = 'info';
                break;
              case 'CONFIRMED':
                color = 'success';
                break;
              case 'CANCELLED':
                color = 'error';
                break;
              case 'DECLINED':
                color = 'error';
                break;
              case 'EXPIRED':
                color = 'error';
                break;
              default:
                color = 'default';
            }

            return <Chip label={status} color={color} size="small" />;
          }}
        />
      </Column>

      {/* Payment Status */}
      <Column source="paymentStatus" field={TextField} label="Payment Status">
        <FunctionField
          render={(record) => {
            const status = record.paymentStatus;
            let color = 'default';

            switch (status) {
              case 'PENDING':
                color = 'warning';
                break;
              case 'UNATTEMPTED':
                color = 'info';
                break;
              case 'PAID':
                color = 'success';
                break;
              case 'FAILED':
                color = 'error';
                break;
              case 'CANCELLED':
                color = 'error';
                break;
              case 'EXPIRED':
                color = 'error';
                break;
              default:
                color = 'default';
            }
            return <Chip label={status} color={color} size="small" />;
          }}
        />
      </Column>

      {/* Created At */}
      <Column source="createdAt" field={DateField} />

      {/* Action */}
      <Column label="Action">
        <Stack direction={'row'} justifyItems={'center'} gap={1}>
          <ShowButton />
        </Stack>
      </Column>
    </Table>
  );
};

export default BookingListDesktop;
