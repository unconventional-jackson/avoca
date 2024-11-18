import '../Auth.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/useAuth';
import { Grid } from '@mui/material';
import { CustomInput } from '../../../components/Custom/Input';
import { CustomButton } from '../../../components/Button/Button';

export function VerifyEmailScreen() {
  const navigate = useNavigate();
  const { resendVerification, verifyEmail } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handleChangeCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  }, []);

  const handleVerifyEmail = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoading(true);
        await verifyEmail(email.toLowerCase(), code);
        toast.success('Email verified successfully');
        navigate('/totp-setup', { state: { email } });
      } catch (error) {
        toast.error('Failed to verify email');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [email, code, verifyEmail, navigate]
  );

  const handleResendVerification = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoading(true);
        await resendVerification(email.toLowerCase());
        toast.success('Verification email sent');
      } catch (error) {
        toast.error('Failed to send verification email');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [email, resendVerification]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className="form-label">Email</div>
        <CustomInput
          placeholder="Enter your email"
          value={email}
          type="email"
          onChange={handleChangeEmail}
        />
      </Grid>

      <Grid item xs={12}>
        <div className="form-label">Verification Code</div>
        <CustomInput
          placeholder="Enter the verification code"
          value={code}
          onChange={handleChangeCode}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomButton
          type="primary"
          onClick={handleVerifyEmail}
          loading={loading}
          style={{
            width: '100%',
          }}
        >
          Verify Email
        </CustomButton>
      </Grid>

      <Grid item xs={12}>
        <CustomButton
          type="default"
          onClick={handleResendVerification}
          loading={loading}
          style={{
            width: '100%',
          }}
        >
          Resend Verification Email
        </CustomButton>
      </Grid>
    </Grid>
  );
}
