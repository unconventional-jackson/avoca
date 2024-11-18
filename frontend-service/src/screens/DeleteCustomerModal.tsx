import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { parseAxiosError } from '../utils/errors';
import { Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSdk } from '../api/sdk';

interface DeleteCustomerModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => Promise<unknown>;
  customerId: string;
}

export function DeleteCustomerModal({
  open,
  onClose,
  refetch,
  customerId,
}: DeleteCustomerModalProps) {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const apiSdk = useSdk();

  const [loading, setLoading] = useState(false);
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      await apiSdk.deleteCustomer({
        input: {
          customerId,
        },
      });
      await refetch();
      onClose();
    } catch (error) {
      toast.error(`Failed to create team: ${parseAxiosError(error)}`);
    } finally {
      setLoading(false);
    }
  }, [apiSdk, clientId, onClose, refetch, queryClient]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          Are you sure you want to delete this customer?
        </Typography>
        <Typography variant="body2" gutterBottom>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <LoadingButton autoFocus onClick={handleSubmit} disabled={loading} loading={loading}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
