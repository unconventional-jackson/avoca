import { useCallback, useMemo, useState } from 'react';
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
import { useCustomersSdk } from '../api/sdk';

interface CreateCustomerAddressesModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => Promise<unknown>;
  customerId: string;
}

export function CreateCustomerAddressesModal({
  open,
  customerId,
  onClose,
  refetch,
}: CreateCustomerAddressesModalProps) {
  const customersSdk = useCustomersSdk();

  const [street, setStreet] = useState('');
  const handleChangeStreet = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStreet(event.target.value);
  }, []);

  /**
   * Manage the street line 2
   */
  const [streetLine2, setStreetLine2] = useState('');
  const handleChangeStreetLine2 = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStreetLine2(event.target.value);
  }, []);

  /**
   * Manage the city
   */
  const [city, setCity] = useState('');
  const handleChangeCity = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  }, []);

  /**
   * Manage the state
   */
  const [state, setState] = useState('');
  const handleChangeState = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value as string);
  }, []);

  /**
   * Manage the zip code
   */
  const [zipCode, setZipCode] = useState('');
  const handleChangeZipCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(event.target.value);
  }, []);

  /**
   * Create the address
   */
  const disabled = useMemo(() => {
    if (!street || !city || !state || !zipCode) {
      return true;
    }
  }, [street, city, state, zipCode]);
  const [loading, setLoading] = useState(false);
  const handleCreateAddress = useCallback(async () => {
    try {
      setLoading(true);
      await customersSdk.postCustomerCustomerIdAddresses(customerId, {
        street,
        street_line_2: streetLine2,
        city,
        state,
        zip: zipCode,
        country: 'US',
      });
      await onClose();
      await refetch();
    } catch (error) {
      console.error('Error creating address:', error);
    } finally {
      setLoading(false);
    }
  }, [customerId, street, streetLine2, city, state, zipCode, onClose, refetch]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Addresses</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Address Line 1"
              variant="outlined"
              margin="normal"
              value={street}
              onChange={handleChangeStreet}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Address Line 2"
              variant="outlined"
              margin="normal"
              value={streetLine2}
              onChange={handleChangeStreetLine2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              variant="outlined"
              margin="normal"
              value={city}
              onChange={handleChangeCity}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="State"
              variant="outlined"
              margin="normal"
              value={state}
              onChange={handleChangeState}
              required
            >
              <MenuItem value="AK">Alaska</MenuItem>
              <MenuItem value="AL">Alabama</MenuItem>
              <MenuItem value="AR">Arkansas</MenuItem>
              <MenuItem value="AS">American Samoa</MenuItem>
              <MenuItem value="AZ">Arizona</MenuItem>
              <MenuItem value="CA">California</MenuItem>
              <MenuItem value="CO">Colorado</MenuItem>
              <MenuItem value="CT">Connecticut</MenuItem>
              <MenuItem value="DC">District of Columbia</MenuItem>
              <MenuItem value="DE">Delaware</MenuItem>
              <MenuItem value="FL">Florida</MenuItem>
              <MenuItem value="GA">Georgia</MenuItem>
              <MenuItem value="GU">Guam</MenuItem>
              <MenuItem value="HI">Hawaii</MenuItem>
              <MenuItem value="IA">Iowa</MenuItem>
              <MenuItem value="ID">Idaho</MenuItem>
              <MenuItem value="IL">Illinois</MenuItem>
              <MenuItem value="IN">Indiana</MenuItem>
              <MenuItem value="KS">Kansas</MenuItem>
              <MenuItem value="KY">Kentucky</MenuItem>
              <MenuItem value="LA">Louisiana</MenuItem>
              <MenuItem value="MA">Massachusetts</MenuItem>
              <MenuItem value="MD">Maryland</MenuItem>
              <MenuItem value="ME">Maine</MenuItem>
              <MenuItem value="MI">Michigan</MenuItem>
              <MenuItem value="MN">Minnesota</MenuItem>
              <MenuItem value="MO">Missouri</MenuItem>
              <MenuItem value="MP">Northern Mariana Islands</MenuItem>
              <MenuItem value="MS">Mississippi</MenuItem>
              <MenuItem value="MT">Montana</MenuItem>
              <MenuItem value="NC">North Carolina</MenuItem>
              <MenuItem value="ND">North Dakota</MenuItem>
              <MenuItem value="NE">Nebraska</MenuItem>
              <MenuItem value="NH">New Hampshire</MenuItem>
              <MenuItem value="NJ">New Jersey</MenuItem>
              <MenuItem value="NM">New Mexico</MenuItem>
              <MenuItem value="NV">Nevada</MenuItem>
              <MenuItem value="NY">New York</MenuItem>
              <MenuItem value="OH">Ohio</MenuItem>
              <MenuItem value="OK">Oklahoma</MenuItem>
              <MenuItem value="OR">Oregon</MenuItem>
              <MenuItem value="PA">Pennsylvania</MenuItem>
              <MenuItem value="PR">Puerto Rico</MenuItem>
              <MenuItem value="RI">Rhode Island</MenuItem>
              <MenuItem value="SC">South Carolina</MenuItem>
              <MenuItem value="SD">South Dakota</MenuItem>
              <MenuItem value="TN">Tennessee</MenuItem>
              <MenuItem value="TT">Trust Territories</MenuItem>
              <MenuItem value="TX">Texas</MenuItem>
              <MenuItem value="UT">Utah</MenuItem>
              <MenuItem value="VA">Virginia</MenuItem>
              <MenuItem value="VI">Virgin Islands</MenuItem>
              <MenuItem value="VT">Vermont</MenuItem>
              <MenuItem value="WA">Washington</MenuItem>
              <MenuItem value="WI">Wisconsin</MenuItem>
              <MenuItem value="WV">West Virginia</MenuItem>
              <MenuItem value="WY">Wyoming</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Zip Code"
              variant="outlined"
              margin="normal"
              type="number"
              value={zipCode}
              onChange={handleChangeZipCode}
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          autoFocus
          onClick={handleCreateAddress}
          disabled={disabled}
          loading={loading}
        >
          Create Address
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
