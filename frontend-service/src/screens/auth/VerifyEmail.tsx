import './Auth.css';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { parseAxiosError } from '../../utils/errors';

export function VerifyEmailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resendVerification, verifyEmail } = useAuth();
  /**
   * If the user was redirected here from the sign-up screen, the email will be in the location state.
   */
  const [email, setEmail] = useState<string>('');
  const handleChangeEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  /**
   * The verification code entered by the user.
   */
  const [code, setCode] = useState<string>('');
  const handleChangeCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
  }, []);

  const [loadingVerifyEmail, setLoadingVerifyEmail] = useState(false);
  const handleVerifyEmail = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoadingVerifyEmail(true);
        await verifyEmail(email.toLowerCase(), code);
        toast.success('Email verified successfully');
        navigate('/totp-setup', { state: { email } });
      } catch (error) {
        toast.error(`Failed to verify email: ${parseAxiosError(error)}`);
      } finally {
        setLoadingVerifyEmail(false);
      }
    },
    [email, code, verifyEmail, navigate]
  );

  const [loadingResendVerification, setLoadingResendVerification] = useState(false);
  const handleResendVerification = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoadingResendVerification(true);
        await resendVerification(email.toLowerCase());
        toast.success('Verification email sent');
      } catch (error) {
        toast.error(`Failed to send verification email: ${parseAxiosError(error)}`);
      } finally {
        setLoadingResendVerification(false);
      }
    },
    [email, resendVerification]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Email"
          placeholder="Enter your email"
          value={email}
          type="email"
          onChange={handleChangeEmail}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Verification Code"
          placeholder="Enter the verification code"
          value={code}
          onChange={handleChangeCode}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <LoadingButton
          variant="contained"
          onClick={handleVerifyEmail}
          loading={loadingVerifyEmail}
          style={{
            width: '100%',
          }}
        >
          Verify Email
        </LoadingButton>
      </Grid>

      <Grid item xs={12}>
        <LoadingButton
          variant="outlined"
          onClick={handleResendVerification}
          loading={loadingResendVerification}
          style={{
            width: '100%',
          }}
        >
          Resend Verification Email
        </LoadingButton>
      </Grid>
    </Grid>
  );
}
