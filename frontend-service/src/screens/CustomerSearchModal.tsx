import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { parseAxiosError } from '../utils/errors';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useCustomersSdk, useInternalSdk } from '../api/sdk';
import { Customer } from '@unconventional-jackson/avoca-external-api';
import { AddCircle, RemoveCircle } from '@mui/icons-material';

interface SearchCustomerModalProps {
  phoneCallId: string;
  open: boolean;
  onClose: () => void;
  refetch: () => Promise<unknown>;
}

export function SearchCustomerModal({
  phoneCallId,
  open,
  onClose,
  refetch,
}: SearchCustomerModalProps) {
  const customersSdk = useCustomersSdk();
  const internalSdk = useInternalSdk();

  /**
   * Manage the searchTerm
   */
  const [searchTerm, setSearchTerm] = useState('');
  const handleChangeSearchTerm = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  /**
   * Debounce a search term
   */
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      setLoading(false);
    }

    if (searchTerm) {
      setLoading(true);
      debounceRef.current = setTimeout(() => {
        customersSdk
          .getV1Customers(searchTerm, 1, 50)
          .then((response) => {
            setCustomers(response.data.customers || []);
          })
          .catch((error) => {
            toast.error(`Failed to search for customers: ${parseAxiosError(error)}`);
          })
          .finally(() => {
            setLoading(false);
          });

        // Do something with the search term
      }, 500);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, customersSdk]);

  const handleSubmit = useCallback(async () => {
    if (!selectedCustomer) {
      return;
    }

    try {
      await internalSdk.updatePhoneCall(phoneCallId, {
        customer_id: selectedCustomer.id,
      });
      await refetch();
      onClose();
    } catch (error) {
      toast.error(`Failed to assign customer to call: ${parseAxiosError(error)}`);
    }
  }, [selectedCustomer, internalSdk, phoneCallId, refetch, onClose]);
  /**
   * Reset the state whenever the Modal opens
   */
  const handleClose = useCallback(() => {
    setSearchTerm('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} m={2}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleChangeSearchTerm}
            />
          </Grid>
          <Divider />
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress size={40} />
            </Box>
          ) : !customers?.length ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <Typography variant="body2" textAlign="center" flex={1}>
                No customers found
              </Typography>
            </Box>
          ) : (
            customers.map((customer) => (
              <Grid item xs={12} key={customer.id}>
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" flexDirection="column">
                    <Typography variant="body1">
                      {customer.first_name} {customer.last_name}
                    </Typography>
                    <Typography variant="body2">{customer.email}</Typography>
                  </Box>
                  <IconButton onClick={() => setSelectedCustomer(customer)}>
                    {selectedCustomer?.id === customer.id ? <RemoveCircle /> : <AddCircle />}
                  </IconButton>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={handleClose}>Cancel</LoadingButton>
        <LoadingButton
          autoFocus
          onClick={handleSubmit}
          disabled={loading || !selectedCustomer}
          loading={loading}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
