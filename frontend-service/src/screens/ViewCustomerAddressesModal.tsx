import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useCustomersSdk } from '../api/sdk';
import { GetCustomerCustomerIdAddressesRequest } from '@unconventional-jackson/avoca-external-api';

interface ViewCustomerAddressesModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => Promise<unknown>;
  customerId: string;
}

export function ViewCustomerAddressesModal({
  open,
  customerId,
  onClose,
}: ViewCustomerAddressesModalProps) {
  const customersSdk = useCustomersSdk();

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Addresses</Typography>
          </Grid>
          {getAddressesQuery.isFetching ? (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            </Grid>
          ) : getAddressesQuery?.data?.addresses?.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1">No addresses found</Typography>
            </Grid>
          ) : (
            getAddressesQuery?.data?.addresses?.map((address, index) => (
              <Fragment key={address.id}>
                <Grid item xs={12}>
                  <Typography variant="body2">Address {index + 1}</Typography>
                  <Typography variant="body1">
                    {address.street}
                    {address.street_line_2 ? ', ' + address.street_line_2 : ''}, {address.city},{' '}
                    {address.state} {address.zip}
                  </Typography>
                </Grid>
              </Fragment>
            ))
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton autoFocus onClick={onClose}>
          OK
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
