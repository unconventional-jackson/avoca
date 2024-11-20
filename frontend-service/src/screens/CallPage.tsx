import { Box, Container, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { usePhoneCalls } from '../contexts/PhoneCallsContext';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInternalSdk } from '../api/sdk';
import { toast } from 'react-toastify';
import { CopyAll, Create, Search } from '@mui/icons-material';
import { SearchCustomerModal } from './CustomerSearchModal';

export function CallPage() {
  const { phone_call_id } = useParams();
  const { phoneCalls } = usePhoneCalls();

  const callsSdk = useInternalSdk();

  const getCallQuery = useQuery({
    queryKey: ['phoneCalls', phone_call_id],
    queryFn: async () => {
      const response = await callsSdk.getPhoneCalls(phone_call_id);
      return response.data;
    },
    enabled: !!phone_call_id,
    // retry: 1,
  });

  const call = useMemo(
    () => ({
      ...phoneCalls.find((call) => call.phone_call_id === phone_call_id),
      ...getCallQuery.data,
    }),
    [phoneCalls, phone_call_id]
  );

  /**
   * Launch the customer search modal
   */
  const [isCustomerSearchModalOpen, setIsCustomerSearchModalOpen] = useState(false);
  const handleOpenCustomerSearchModal = useCallback(() => {
    setIsCustomerSearchModalOpen(true);
  }, []);
  const handleCloseCustomerSearchModal = useCallback(() => {
    setIsCustomerSearchModalOpen(false);
  }, []);

  /**
   * Launch the job creation modal
   */
  const [isJobCreationModalOpen, setIsJobCreationModalOpen] = useState(false);
  const handleOpenJobCreationModal = useCallback(() => {
    if (!call.customer_id || !!call.job_id) {
      return;
    }
    setIsJobCreationModalOpen(true);
  }, []);
  const handleCloseJobCreationModal = useCallback(() => {
    setIsJobCreationModalOpen(false);
  }, []);

  /**
   * Copy the customer ID to the clipboard - useful for searching in the CRM or support w/ engineering
   */
  const handleCopyCustomerIdToClipboard = useCallback(() => {
    if (!call.customer_id) {
      return;
    }
    navigator.clipboard
      .writeText(call.customer_id)
      .then(() => {
        toast.info('Copied customer ID to clipboard');
      })
      .catch((error) => {
        toast.error('Failed to copy customer ID to clipboard');
        console.error(error);
      });
  }, [call.customer_id]);

  /**
   * Copy the job ID to the clipboard - useful for searching in the CRM or support w/ engineering
   */
  const handleCopyJobIdToClipboard = useCallback(() => {
    if (!call.job_id) {
      return;
    }
    navigator.clipboard
      .writeText(call.job_id)
      .then(() => {
        toast.info('Copied job ID to clipboard');
      })
      .catch((error) => {
        toast.error('Failed to copy job ID to clipboard');
        console.error(error);
      });
  }, [call.job_id]);

  /**
   * Copy the employee ID to the clipboard - useful for searching in the CRM or support w/ engineering
   */
  const handleCopyEmployeeIdToClipboard = useCallback(() => {
    if (!call.employee_id) {
      return;
    }
    navigator.clipboard
      .writeText(call.employee_id)
      .then(() => {
        toast.info('Copied agent ID to clipboard');
      })
      .catch((error) => {
        toast.error('Failed to copy agent ID to clipboard');
        console.error(error);
      });
  }, [call.employee_id]);

  /**
   * Copy the phone number to the clipboard - useful for searching in the CRM or support w/ engineering
   */
  const handleCopyPhoneNumberToClipboard = useCallback(() => {
    if (!call.phone_number) {
      return;
    }
    navigator.clipboard
      .writeText(call.phone_number)
      .then(() => {
        toast.info('Copied phone number to clipboard');
      })
      .catch((error) => {
        toast.error('Failed to copy phone number to clipboard');
        console.error(error);
      });
  }, [call.phone_number]);

  if (!phone_call_id) {
    return null;
  }

  return (
    <Box>
      <Container>
        <h1>Phone Call</h1>
        <p>Call ID: {phone_call_id}</p>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Customer</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {call?.customer_id ? call.customer_id : 'Unassigned'}
              </Typography>
              {call.customer_id ? (
                <IconButton onClick={handleCopyCustomerIdToClipboard} disabled={!call.customer_id}>
                  <CopyAll />
                </IconButton>
              ) : (
                <Tooltip title="Search for a customer to assign to this call">
                  <IconButton onClick={handleOpenCustomerSearchModal} disabled={!!call.customer_id}>
                    <Search />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Job</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">{call?.job_id ? call.job_id : 'Unassigned'}</Typography>
              {call.job_id ? (
                <IconButton onClick={handleCopyJobIdToClipboard} disabled={!call.job_id}>
                  <CopyAll />
                </IconButton>
              ) : (
                <Tooltip
                  title={
                    !call.customer_id
                      ? 'You must assign a customer before you can assign a job'
                      : 'Create Job'
                  }
                >
                  <IconButton onClick={handleOpenJobCreationModal}>
                    <Create />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Agent</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {call?.employee_id ? call.employee_id : 'Unassigned'}
              </Typography>
              <IconButton onClick={handleCopyEmployeeIdToClipboard} disabled={!call.employee_id}>
                <CopyAll />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Phone Number</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {call?.phone_number ? call.phone_number : 'Unassigned'}
              </Typography>
              <IconButton onClick={handleCopyPhoneNumberToClipboard} disabled={!call.phone_number}>
                <CopyAll />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2">Start Time</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">
                {call?.start_date_time
                  ? new Date(call.start_date_time)?.toLocaleString()
                  : 'Missing Information'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2">End Time</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">
                {call?.end_date_time ? new Date(call.end_date_time)?.toLocaleString() : 'Ongoing'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2">Duration</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body1">
                {call.elapsed
                  ? `${call.elapsed} seconds`
                  : call.start_date_time && call.end_date_time
                    ? `${(new Date(call.end_date_time).getTime() - new Date(call.start_date_time).getTime()) / 1000} seconds`
                    : call.start_date_time && !call.end_date_time
                      ? 'Ongoing'
                      : 'Unknown'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Divider
          sx={{
            mt: 2,
            mb: 2,
          }}
        />
        <Box>
          <Typography variant="h6" mb={2}>
            Transcript
          </Typography>
          <Typography variant="body2">{call?.transcript}</Typography>
        </Box>
      </Container>
      <SearchCustomerModal
        open={isCustomerSearchModalOpen}
        onClose={handleCloseCustomerSearchModal}
        phoneCallId={phone_call_id}
        refetch={getCallQuery.refetch}
      />
    </Box>
  );
}
