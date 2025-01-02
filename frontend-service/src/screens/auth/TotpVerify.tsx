import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Grid, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export function TotpVerifyScreen() {
  const navigate = useNavigate();
  const { authUser, totpVerify } = useAuth();
  const [totpCode, setTotpCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Handle TOTP verification
  const handleTotpVerify = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      if (!authUser?.email) {
        toast.error("User's email is not available for TOTP verification");
        return;
      }
      try {
        setLoading(true);
        await totpVerify(authUser?.email, totpCode); // Pass the email along with the TOTP code
        toast.success('TOTP verified successfully');
        navigate(`/app`);
      } catch (error) {
        toast.error('Failed to verify TOTP');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [authUser?.email, totpCode, totpVerify, navigate]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Enter the code from your authenticator app</Typography>
        <TextField
          label="TOTP Code"
          placeholder="Enter the TOTP code"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <LoadingButton
          variant="contained"
          onClick={handleTotpVerify}
          loading={loading}
          disabled={!totpCode}
          style={{ width: '100%' }}
        >
          Verify TOTP
        </LoadingButton>
      </Grid>
    </Grid>
  );
}
