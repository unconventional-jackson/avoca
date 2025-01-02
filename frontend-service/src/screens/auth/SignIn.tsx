import './Auth.css';

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Grid, TextField } from '@mui/material';
import { parseAxiosError } from '../../utils/errors';
import { LoadingButton } from '@mui/lab';

export function SignInScreen() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState<string>('');
  const handleChangeEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const [password, setPassword] = useState<string>('');
  const handleChangePassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const [loading, setLoading] = useState(false);
  const handleSignIn = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoading(true);
        await signIn(email.toLowerCase(), password);
        navigate(`/app`);
      } catch (error) {
        toast.error(`Failed to sign in: ${parseAxiosError(error)}`);
      } finally {
        setLoading(false);
      }
    },
    [email, password, signIn, navigate]
  );

  const disabled = !email || !password;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Email"
          placeholder="Enter your email"
          value={email}
          type="email"
          onChange={handleChangeEmail}
          tabIndex={2}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Password"
          placeholder="Enter your password"
          value={password}
          type="password"
          onChange={handleChangePassword}
          tabIndex={3}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <LoadingButton
          variant="contained"
          onClick={handleSignIn}
          disabled={disabled}
          loading={loading}
          style={{
            width: '100%',
          }}
          tabIndex={4}
        >
          Login
        </LoadingButton>
      </Grid>
      <Grid item xs={6}>
        <Button variant="text" onClick={() => navigate('/forgot-password')} fullWidth>
          Forgot your password? Reset it.
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button variant="text" onClick={() => navigate('/sign-up')} fullWidth>
          Need an account? Sign up.
        </Button>
      </Grid>
    </Grid>
  );
}
