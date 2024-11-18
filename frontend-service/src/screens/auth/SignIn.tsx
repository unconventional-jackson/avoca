import '../Auth.css';

import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Logger } from '../../../utils/logger';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/useAuth';
import { Grid } from '@mui/material';
import { CustomButton } from '../../../components/Button/Button';
import { CustomInput } from '../../../components/Custom/Input';
import { parseAxiosError } from '../../../utils/errors';

const log = new Logger('SignInScreen');

export function SignInScreen() {
  const navigate = useNavigate();
  const { signIn, userType } = useAuth();

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
        log.info('Sign in successful', { email });
        navigate(`/app/${userType}`);
      } catch (error) {
        toast.error(`Failed to sign in: ${parseAxiosError(error)}`);
      } finally {
        setLoading(false);
      }
    },
    [email, password, userType, signIn, navigate]
  );

  const disabled = !email || !password;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className="form-label">Email</div>
        <CustomInput
          placeholder="Enter your email"
          value={email}
          type="email"
          onChange={handleChangeEmail}
          tabIndex={2}
        />
      </Grid>
      <Grid item xs={12}>
        <div className="form-label">Password</div>
        <CustomInput
          placeholder="Enter your password"
          value={password}
          type="password"
          onChange={handleChangePassword}
          tabIndex={3}
        />
        <Link to="/forgot-password">
          <div className="Auth-link-left" tabIndex={5}>
            Forgot your password? Reset it.
          </div>
        </Link>
      </Grid>
      <Grid item xs={12}>
        <CustomButton
          type="primary"
          onClick={handleSignIn}
          disabled={disabled}
          loading={loading}
          style={{
            width: '100%',
          }}
          tabIndex={4}
        >
          Login
        </CustomButton>
      </Grid>
      <Grid item xs={12}>
        <Link to="/sign-up" tabIndex={6}>
          <div className="Auth-link-centered">Need an account? Sign up.</div>
        </Link>
      </Grid>
    </Grid>
  );
}
