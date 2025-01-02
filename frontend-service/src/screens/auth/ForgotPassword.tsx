import './Auth.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { parseAxiosError } from '../../utils/errors';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState<string>('');
  const handleChangeEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handleForgotPassword = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      requestPasswordReset(email.toLowerCase())
        .then(() => {
          navigate('/password-reset');
        })
        .catch((error) => {
          toast.error(`Failed to request password reset: ${parseAxiosError(error)}`);
        });
    },
    [email, navigate, requestPasswordReset]
  );

  const disabled = !email;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">
          Forgot your password? Enter your email address below to request a password reset.
        </Typography>
      </Grid>
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
        <LoadingButton
          variant="contained"
          onClick={handleForgotPassword}
          disabled={disabled}
          style={{
            width: '100%',
          }}
        >
          Request Password Reset
        </LoadingButton>
      </Grid>

      <Grid item xs={12}>
        <Button variant="text" onClick={() => navigate('/password-reset')} fullWidth>
          Already have a password reset code?
        </Button>
      </Grid>
    </Grid>
  );
}
