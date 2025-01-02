import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { useCustomersSdk, useJobsSdk } from '../api/sdk';
import { GetCustomerCustomerIdAddressesRequest } from '@unconventional-jackson/avoca-external-api';
import { DateTime } from 'luxon';

interface EditJobModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  customerId: string;
}

export function EditJobModal({ open, jobId, customerId, onClose }: EditJobModalProps) {
  const jobsSdk = useJobsSdk();
  const customersSdk = useCustomersSdk();

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

  const getJobQuery = useQuery({
    queryKey: [
      'job',
      {
        jobId,
      },
    ],
    queryFn: async () => {
      const response = await jobsSdk.getJobsId(jobId);
      return response.data;
    },
    enabled: !!jobId,
  });
  const job = useMemo(() => getJobQuery.data, [getJobQuery.data]);
  useEffect(() => {
    if (job) {
      // @ts-ignore Bad type definitions
      setSelectedAddressId(job.address_id ?? job.address?.id ?? '');
      setScheduledStart(
        job.schedule?.scheduled_start ? DateTime.fromISO(job.schedule?.scheduled_start) : null
      );
      setScheduledEnd(
        job.schedule?.scheduled_end ? DateTime.fromISO(job.schedule?.scheduled_end) : null
      );
      setArrivalWindow(job.schedule?.arrival_window?.toString() ?? '');
      setNotes(job.notes?.map((note) => note.content).join('\n') ?? '');
      setInvoiceNumber(job.invoice_number ?? '');
      setTags(job.tags?.join(', ') ?? '');
      setLeadSource(job.lead_source ?? '');
    }
  }, [job]);

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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Edit Job for Customer</Typography>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Customer Address is not editable at this time">
              <span>
                <TextField
                  fullWidth
                  select
                  label="Customer Address"
                  variant="outlined"
                  // margin="normal"
                  value={selectedAddressId}
                  onChange={handleChangeSelectedAddressId}
                  required
                  disabled
                >
                  {(getAddressesQuery.data?.addresses ?? []).map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {address.street}
                      {address.street_line_2 ? ', ' + address.street_line_2 : ''}, {address.city},{' '}
                      {address.state}, {address.zip}
                    </MenuItem>
                  ))}
                </TextField>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Scheduled Start Date is not editable at this time">
              <span>
                <DatePicker
                  label="Scheduled Start Date"
                  value={scheduledStart}
                  onChange={handleChangeScheduledStart}
                  disabled
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      // margin: 'normal',
                    },
                  }}
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Scheduled End Date is not editable at this time">
              <span>
                <DatePicker
                  label="Scheduled End Date"
                  value={scheduledEnd}
                  onChange={handleChangeScheduledEnd}
                  disabled
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      // margin: 'normal',
                    },
                  }}
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Arrival Window is not editable at this time">
              <span>
                <TextField
                  label="Arrival Window"
                  name="name"
                  type="text"
                  value={arrivalWindow}
                  onChange={handleChangeArrivalWindow}
                  placeholder="15 minutes"
                  required
                  fullWidth
                  disabled
                  // margin="normal"
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Notes are not editable at this time">
              <span>
                <TextField
                  label="Notes"
                  name="name"
                  type="text"
                  value={notes}
                  onChange={handleChangeNotes}
                  placeholder="Enter notes, if applicable"
                  required
                  fullWidth
                  disabled
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Invoice Number is not editable at this time">
              <span>
                <TextField
                  label="Invoice Number"
                  name="name"
                  type="text"
                  value={invoiceNumber}
                  onChange={handleChangeInvoiceNumber}
                  placeholder="123456"
                  required
                  fullWidth
                  disabled
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Tags are not editable at this time">
              <span>
                <TextField
                  label="Tags"
                  name="name"
                  type="text"
                  value={tags}
                  onChange={handleChangeTags}
                  placeholder="Tags"
                  required
                  fullWidth
                  disabled
                />
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Tags are not editable at this time">
              <span>
                <TextField
                  label="Lead Source"
                  name="name"
                  type="text"
                  value={leadSource}
                  onChange={handleChangeLeadSource}
                  placeholder="Lead Source"
                  required
                  fullWidth
                  disabled
                />
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={handleClose}>Cancel</LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
