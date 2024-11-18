import '../Auth.css';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Logger } from '../../../utils/logger';
import { useAuth } from '../../../contexts/useAuth';
import { toast } from 'react-toastify';
import { parseAxiosError } from '../../../utils/errors';
import { Grid } from '@mui/material';
import { CustomButton } from '../../../components/Button/Button';
import { CustomInput } from '../../../components/Custom/Input';

const log = new Logger('ForgotPasswordScreen');

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
          log.error(error, { detail: 'Failed to request password reset' });
        });
    },
    [email, navigate, requestPasswordReset]
  );

  const disabled = !email;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <h4 className="Auth-subtitle">Forgot your password?</h4>
      </Grid>
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
        <CustomButton
          type="primary"
          onClick={handleForgotPassword}
          disabled={disabled}
          style={{
            width: '100%',
          }}
        >
          Request Password Reset
        </CustomButton>
      </Grid>

      <Grid item xs={12}>
        <Link to="/password-reset">
          <div className="Auth-link-centered">Already have a password reset code?</div>
        </Link>
      </Grid>
    </Grid>
  );
}
