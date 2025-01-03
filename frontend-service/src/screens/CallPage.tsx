import { Box, Container, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { usePhoneCalls } from '../contexts/PhoneCallsContext';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInternalSdk } from '../api/sdk';
import { toast } from 'react-toastify';
import { CopyAll, Create, Info, NavigateNext, Refresh, Search } from '@mui/icons-material';
import { SearchCustomerModal } from './CustomerSearchModal';
import { CreateJobModal } from './CreateJobModal';
import { parseAxiosError } from '../utils/errors';
import { Customer } from '@unconventional-jackson/avoca-external-api';
import { EditCustomerModal } from './EditCustomerModal';
import { EditJobModal } from './EditJobModal';

export function CallPage() {
  const { phone_call_id } = useParams();
  const { phoneCalls } = usePhoneCalls();

  const callsSdk = useInternalSdk();

  const getCallQuery = useQuery({
    queryKey: ['phoneCalls', phone_call_id],
    queryFn: async () => {
      try {
        if (!phone_call_id) {
          throw new Error('Missing phone call ID');
        }
        const response = await callsSdk.getPhoneCall(phone_call_id);
        return response.data;
      } catch (error) {
        toast.error(`Failed to fetch phone call: ${parseAxiosError(error)}`);
        throw error;
      }
    },
    enabled: !!phone_call_id,
    // retry: 1,
  });

  const call = useMemo(
    () => ({
      ...getCallQuery.data,
      ...phoneCalls.find((call) => call.phone_call_id === phone_call_id),
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
    console.log('handleOpenJobCreationModal');
    if (!call.customer_id || !!call.job_id) {
      return;
    }
    setIsJobCreationModalOpen(true);
  }, [call.customer_id, call.job_id]);
  const handleCloseJobCreationModal = useCallback(() => {
    setIsJobCreationModalOpen(false);
  }, []);

  /**
   * Parse useful customer details
   */
  const customerDetails = useMemo(() => {
    if (!call.customer_id) {
      return null;
    }
    if (call.customer?.id) {
      const customer = call.customer as Customer;
      if (customer?.first_name && customer?.last_name) {
        return `${customer.first_name} ${customer.last_name}`;
      }
      if (customer?.first_name) {
        return customer.first_name;
      }
      if (customer?.last_name) {
        return customer.last_name;
      }
      if (customer?.email) {
        return customer.email;
      }
      if (customer?.company) {
        return customer.company;
      }
    }
    if (call.customer_id) {
      return call.customer_id;
    }
    return null;
  }, [call.customer_id, call.customer]);

  /**
   * Open the customer modal
   */
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const handleOpenEditCustomerModal = useCallback(() => {
    setIsEditCustomerModalOpen(true);
  }, []);
  const handleCloseEditCustomerModal = useCallback(() => {
    setIsEditCustomerModalOpen(false);
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
   * Open the job modal
   */
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const handleOpenEditJobModal = useCallback(() => {
    setIsEditJobModalOpen(true);
  }, []);
  const handleCloseEditJobModal = useCallback(() => {
    setIsEditJobModalOpen(false);
  }, []);

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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" mt={2}>
            Phone Call
          </Typography>
          <Box>
            <IconButton onClick={() => getCallQuery.refetch()}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        <Divider
          sx={{
            mt: 2,
            mb: 2,
          }}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">Customer</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">{customerDetails ?? 'Unassigned'}</Typography>
              {call.customer_id ? (
                <Box>
                  <IconButton onClick={handleOpenEditCustomerModal} disabled={!call.customer_id}>
                    <Info />
                  </IconButton>
                  <IconButton
                    onClick={handleCopyCustomerIdToClipboard}
                    disabled={!call.customer_id}
                  >
                    <CopyAll />
                  </IconButton>
                </Box>
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
                <Box>
                  <IconButton onClick={handleOpenEditJobModal}>
                    <NavigateNext />
                  </IconButton>
                  <IconButton onClick={handleCopyJobIdToClipboard} disabled={!call.job_id}>
                    <CopyAll />
                  </IconButton>
                </Box>
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
      {call.customer_id && (
        <Fragment>
          <CreateJobModal
            open={isJobCreationModalOpen}
            onClose={handleCloseJobCreationModal}
            customerId={call.customer_id}
            refetch={getCallQuery.refetch}
            phoneCallId={phone_call_id}
          />
          <EditCustomerModal
            open={isEditCustomerModalOpen}
            onClose={handleCloseEditCustomerModal}
            customerId={call.customer_id}
            refetch={getCallQuery.refetch}
          />
        </Fragment>
      )}
      {call.customer_id && call.job_id && (
        <EditJobModal
          open={isEditJobModalOpen}
          onClose={handleCloseEditJobModal}
          jobId={call.job_id}
          customerId={call.customer_id}
        />
      )}
    </Box>
  );
}
