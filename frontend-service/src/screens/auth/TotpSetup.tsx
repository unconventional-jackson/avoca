import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { QRCode } from '../../components/QRCode/QRCode';
import { Grid, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { parseAxiosError } from '../../utils/errors';

export function TotpSetupScreen() {
  const navigate = useNavigate();
  const { authUser, totpSetup, totpVerify } = useAuth();
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch the TOTP setup URL (otpauth URL) when the screen loads

  useEffect(() => {
    async function fetchTotpSetup() {
      if (!authUser?.email) {
        return;
      }
      try {
        setLoading(true);
        const response = await totpSetup(authUser?.email);
        if (!response.otpauth_url) {
          throw new Error('Failed to fetch TOTP setup');
        }
        setOtpauthUrl(response.otpauth_url);
      } catch (error) {
        toast.error(`Failed to fetch TOTP setup: ${parseAxiosError(error)}`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTotpSetup();
  }, [totpSetup, authUser?.email]);

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
        toast.error(`Failed to verify TOTP: ${parseAxiosError(error)}`);
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
        <Typography variant="h6">Set up Two-Factor Authentication (2FA)</Typography>
      </Grid>
      {otpauthUrl ? (
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Typography variant="body2">
            Scan the QR code below with your Google Authenticator app:
          </Typography>
          <QRCode data={otpauthUrl} altText="TOTP QR Code" />
        </Grid>
      ) : (
        <p>Loading QR code...</p>
      )}

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
