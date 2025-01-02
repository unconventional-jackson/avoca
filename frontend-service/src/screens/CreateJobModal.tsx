import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { parseAxiosError } from '../utils/errors';
import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { useCustomersSdk, useInternalSdk, useJobsSdk } from '../api/sdk';
import { useAuth } from '../contexts/AuthContext';
import { GetCustomerCustomerIdAddressesRequest } from '@unconventional-jackson/avoca-external-api';
import { DateTime } from 'luxon';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => Promise<unknown>;
  customerId: string;
  phoneCallId: string;
}

export function CreateJobModal({
  open,
  customerId,
  phoneCallId,
  onClose,
  refetch,
}: CreateJobModalProps) {
  const jobsSdk = useJobsSdk();
  const customersSdk = useCustomersSdk();
  const internalSdk = useInternalSdk();
  const { authUser } = useAuth();

  /**
   * Manage the selected address
   */
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const handleChangeSelectedAddressId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedAddressId(event.target.value);
    },
    []
  );
  const getAddressesQuery = useQuery({
    queryKey: [
      'addresses',
      {
        customerId,
      },
    ],
    queryFn: async () => {
      const response = await customersSdk.getCustomerCustomerIdAddresses(customerId);
      return response.data as unknown as GetCustomerCustomerIdAddressesRequest;
    },
    enabled: !!customerId,
  });

  /**
   * Manage the scheduled start date
   */
  const [scheduledStart, setScheduledStart] = useState<DateTime | null>(null);
  const handleChangeScheduledStart = useCallback((newValue: DateTime | null) => {
    setScheduledStart(newValue);
  }, []);

  /**
   * Manage the scheduled end date
   */
  const [scheduledEnd, setScheduledEnd] = useState<DateTime | null>(null);
  const handleChangeScheduledEnd = useCallback((newValue: DateTime | null) => {
    setScheduledEnd(newValue);
  }, []);

  /**
   * Manage the arrival window
   */
  const [arrivalWindow, setArrivalWindow] = useState('');
  const handleChangeArrivalWindow = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setArrivalWindow(e.target.value?.replace(/\D/g, ''));
  }, []);

  /**
   * Manage the notes
   */
  const [notes, setNotes] = useState('');
  const handleChangeNotes = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(e.target.value);
  }, []);

  /**
   * Manage the invoiceNumber
   */
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const handleChangeInvoiceNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoiceNumber(e.target.value.replace(/\D/g, ''));
  }, []);

  /**
   * Manage the tags
   */
  const [tags, setTags] = useState('');
  const handleChangeTags = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  }, []);

  /**
   * Manage the leadSource
   */
  const [leadSource, setLeadSource] = useState('');
  const handleChangeLeadSource = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLeadSource(e.target.value);
  }, []);

  /**
   * Reset the state whenever the Modal opens
   */
  const handleClose = useCallback(() => {
    setSelectedAddressId('');
    setScheduledStart(null);
    setScheduledEnd(null);
    setArrivalWindow('');
    setNotes('');
    setInvoiceNumber('');
    setTags('');
    setLeadSource('');
    onClose();
  }, [onClose]);

  const [loading, setLoading] = useState(false);
  const disableSubmit = useMemo(() => {
    if (!selectedAddressId) {
      return true;
    }
    if (!customerId) {
      return true;
    }
    if (!scheduledStart) {
      return true;
    }
    if (!scheduledEnd) {
      return true;
    }
    if (!arrivalWindow) {
      return true;
    }
    return false;
  }, [loading, selectedAddressId, customerId, scheduledStart, scheduledEnd, arrivalWindow]);
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobsSdk.postJobs({
        address_id: selectedAddressId,
        customer_id: customerId,
        assigned_employee_ids: authUser?.employee_id ? [authUser?.employee_id] : [],
        invoice_number: Number(invoiceNumber),
        job_fields: {},
        lead_source: leadSource,
        line_items: [],
        notes,
        schedule: {
          arrival_window: Number(arrivalWindow),
          scheduled_end: scheduledEnd?.toISODate() ?? undefined,
          scheduled_start: scheduledStart?.toISODate() ?? undefined,
        },
        tags: tags.split(',').map((tag) => tag.trim()),
      });
      await internalSdk.updatePhoneCall(phoneCallId, {
        job_id: response.data.id,
      });
      await refetch();
      handleClose();
    } catch (error) {
      toast.error(`Failed to create team: ${parseAxiosError(error)}`);
    } finally {
      setLoading(false);
    }
  }, [
    internalSdk,
    authUser?.employee_id,
    customerId,
    handleClose,
    arrivalWindow,
    invoiceNumber,
    jobsSdk,
    leadSource,
    notes,
    refetch,
    scheduledEnd,
    scheduledStart,
    phoneCallId,
    tags,
    selectedAddressId,
  ]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Create Job for Customer</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Customer Address"
              variant="outlined"
              // margin="normal"
              value={selectedAddressId}
              onChange={handleChangeSelectedAddressId}
              required
            >
              {(getAddressesQuery.data?.addresses ?? []).map((address) => (
                <MenuItem key={address.id} value={address.id}>
                  {address.street}
                  {address.street_line_2 ? ', ' + address.street_line_2 : ''}, {address.city},{' '}
                  {address.state}, {address.zip}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              label="Scheduled Start Date"
              value={scheduledStart}
              onChange={handleChangeScheduledStart}
              slotProps={{
                textField: {
                  fullWidth: true,
                  // margin: 'normal',
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              label="Scheduled End Date"
              value={scheduledEnd}
              onChange={handleChangeScheduledEnd}
              slotProps={{
                textField: {
                  fullWidth: true,
                  // margin: 'normal',
                },
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Arrival Window"
              name="name"
              type="text"
              value={arrivalWindow}
              onChange={handleChangeArrivalWindow}
              placeholder="15 minutes"
              required
              fullWidth
              // margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              name="name"
              type="text"
              value={notes}
              onChange={handleChangeNotes}
              placeholder="Enter notes, if applicable"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Invoice Number"
              name="name"
              type="text"
              value={invoiceNumber}
              onChange={handleChangeInvoiceNumber}
              placeholder="123456"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tags"
              name="name"
              type="text"
              value={tags}
              onChange={handleChangeTags}
              placeholder="Tags"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Lead Source"
              name="name"
              type="text"
              value={leadSource}
              onChange={handleChangeLeadSource}
              placeholder="Lead Source"
              required
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={handleClose}>Cancel</LoadingButton>
        <LoadingButton
          autoFocus
          onClick={handleSubmit}
          disabled={loading || disableSubmit}
          loading={loading}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
