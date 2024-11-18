import '../Auth.css';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { QRCode } from '../../components/QRCode/QRCode';
import { Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

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
        toast.error('Failed to fetch TOTP setup');
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
        <h2>Set up Two-Factor Authentication (2FA)</h2>
        {otpauthUrl ? (
          <>
            <p>Scan the QR code below with your Google Authenticator app:</p>
            <QRCode data={otpauthUrl} altText="TOTP QR Code" />
          </>
        ) : (
          <p>Loading QR code...</p>
        )}
      </Grid>

      <Grid item xs={12}>
        <div className="form-label">Enter the code from your authenticator app</div>
        <TextField
          label="TOTP Code"
          placeholder="Enter the TOTP code"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
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
