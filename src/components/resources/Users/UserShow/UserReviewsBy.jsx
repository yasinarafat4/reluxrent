import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { Box, Divider, Paper, Rating, Stack, Typography } from '@mui/material';
import { Quote } from 'lucide-react';
import { ColumnsButton, DataTable, DateField, FunctionField, List, TextField, TopToolbar, useRecordContext } from 'react-admin';
const UserReviewByActions = () => (
  <TopToolbar>
    <ColumnsButton />
    {/* <ExportButton /> */}
  </TopToolbar>
);

const ReviewPanel = () => {
  const record = useRecordContext();
  console.log('By', record);
  if (!record) return null;

  return (
    <Stack gap={2} p={2}>
      {/* Main Review Info */}
      <Stack gap={1}>
        <Typography variant="h6">Review</Typography>

        {/* Message Panel */}
        <Stack
          direction="row"
          spacing={1.2}
          width={'50%'}
          overflow={'hidden'}
          alignItems="flex-start"
          sx={{
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <Quote
              size={20}
              style={{
                transform: 'rotate(180deg)',
                color: 'rgba(0,0,0,0.5)',
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              lineHeight: 1.6,
              fontSize: { xs: 14 },
            }}
          >
            {record.message}
          </Typography>
        </Stack>

        {/* Overall Rating */}
        {record.overallRating && (
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight={600}>
              Overall Rating:
            </Typography>
            <Rating value={Number(record.overallRating)} precision={0.5} readOnly />
            <Typography variant="body2">({Number(record?.overallRating || 0).toFixed(2)})</Typography>
          </Stack>
        )}

        {record.publicResponse && (
          <Stack direction={'row'} gap={0.5}>
            <Stack direction={'row'} gap={0.5} alignItems={'center'}>
              <RecordVoiceOverIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" fontSize={14} fontWeight={600}>
                Public response:
              </Typography>
            </Stack>
            <Typography variant="body2" fontSize={13} fontWeight={500} fontStyle={'italic'}>
              {record.publicResponse}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Divider />

      {/* Ratings Breakdown */}
      <Stack gap={1}>
        <Typography  variant="body1" fontWeight={600}>Category Ratings</Typography>
        {record.ratings?.length > 0 ? (
          <Box display={'grid'} gridTemplateColumns={'repeat(2, 1fr)'} gap={2} mt={1}>
            {record.ratings.map((rating, i) => (
              <Paper
                key={i}
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Stack gap={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} textTransform="capitalize">
                      {rating.category}
                    </Typography>
                    {/* Rating Component */}
                    <Stack direction={'row'} gap={0.5} alignItems={'center'}>
                      <Rating value={Number(rating.score)} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" fontSize={13}>
                        ({Number(record?.overallRating || 0).toFixed(2)})
                      </Typography>
                    </Stack>
                  </Box>
                  {rating.message && (
                    <Stack direction={'row'} gap={0.5} alignItems={'start'}>
                      <CommentOutlinedIcon sx={{ fontSize: 17, mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                        {rating.message}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No category ratings available.
          </Typography>
        )}
      </Stack>

      {/* Optional Secret Feedback / Improvement */}
      {(record.secretFeedback || record.improveMessage) && (
        <>
          <Divider />
          <Stack gap={1}>
            {record.secretFeedback && (
              <Typography variant="body2">
                <strong>Secret Feedback:</strong> {record.secretFeedback}
              </Typography>
            )}
            {record.improveMessage && (
              <Typography variant="body2">
                <strong>Improvement Suggestion:</strong> {record.improveMessage}
              </Typography>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

const UserReviewsBy = () => {
  const record = useRecordContext();
  const userId = record?.id;

  const Table = DataTable;
  const Column = DataTable.Col;

  
  return (
    <List resource="reviews" filter={{ senderId: userId }} actions={<UserReviewByActions />}>
      <Paper elevation={3}>
        <Table bulkActionButtons={false} rowClick={'expand'} expand={<ReviewPanel />} expandSingle>
          <Column source="id" field={TextField} label="ID" />
          {/* Message */}
          <Column source="message">
            <FunctionField
              label="Message"
              render={(record) => (
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: { xs: 13 },
                  }}
                  noWrap
                  title={record.message}
                >
                  {record.message?.length > 30 ? record.message.slice(0, 30) + '...' : record.message || '-'}
                </Typography>
              )}
            />
          </Column>
          {/* Overall Rating */}
          <Column source="overallRating">
            <FunctionField
              label="Overall Rating"
              render={(record) => (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Rating value={Number(record.overallRating) || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    ({Number(record.overallRating).toFixed(2)})
                  </Typography>
                </Stack>
              )}
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
      </Paper>
    </List>
  );
};

export default UserReviewsBy;
