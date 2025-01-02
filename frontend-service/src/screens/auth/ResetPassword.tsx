import './Auth.css';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button, Grid, TextField } from '@mui/material';
import { parseAxiosError } from '../../utils/errors';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';

// Defined outside of the component to avoid re-creating the object on every render
const requirements = {
  '8 characters': /.{8,}/,
  '1 number': /\d/,
  '1 special character': /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/,
  '1 uppercase letter': /[A-Z]/,
  '1 lowercase letter': /[a-z]/,
};

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { confirmPasswordReset } = useAuth();

  const [email, setEmail] = useState<string>('');
  const handleChangeEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const [code, setCode] = useState<string>('');
  const handleChangeCode = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  }, []);

  const [password, setPassword] = useState<string>('');
  const handleChangePassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }, []);

  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const handleChangeConfirmPassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  }, []);

  const [loading, setLoading] = useState(false);
  const handleResetPassword = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoading(true);
        await confirmPasswordReset(email.toLowerCase(), code, password);
        navigate(`/app`);
      } catch (error) {
        toast.error(`Failed to complete password reset: ${parseAxiosError(error)}`);
      } finally {
        setLoading(false);
      }
    },
    [confirmPasswordReset, email, code, password, navigate]
  );

  const emailValid = useMemo(() => /^.+@.+\..+$/.test(email), [email]);

  const passwordsMatch = useMemo(
    () => password && confirmPassword && password === confirmPassword,
    [password, confirmPassword]
  );

  const passwordValid = useMemo(
    () => Object.values(requirements).every((regex) => regex.test(password)),
    [password]
  );

  const disabled = useMemo(
    () => !emailValid || !code || !passwordValid || !passwordsMatch,
    [code, emailValid, passwordValid, passwordsMatch]
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
          label="Code"
          placeholder="Enter the code you received in your email"
          value={code}
          onChange={handleChangeCode}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          type="password"
          onChange={handleChangePassword}
          fullWidth
        />
        {password
          ? Object.entries(requirements).map(([requirement, regex], index) => {
              const satisfied = regex.test(password);
              return (
                <div className="Auth-password-requirement-container" key={index}>
                  <FontAwesomeIcon
                    icon={satisfied ? faCheck : faTimes}
                    className={satisfied ? 'Auth-password-complete' : 'Auth-password-incomplete'}
                  />
                  <p className="Auth-password-requirement">Contains at least {requirement}</p>
                </div>
              );
            })
          : null}
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          type="password"
          onChange={handleChangeConfirmPassword}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <LoadingButton
          variant="contained"
          onClick={handleResetPassword}
          disabled={disabled}
          loading={loading}
          style={{
            width: '100%',
          }}
        >
          Reset Password
        </LoadingButton>
      </Grid>
      <Grid item xs={12}>
        <Button variant="text" onClick={() => navigate('/sign-in')} fullWidth>
          Already have an account? Sign in.
        </Button>
        <Button variant="text" onClick={() => navigate('/sign-up')} fullWidth>
          Need to create an account? Sign up.
        </Button>
      </Grid>
    </Grid>
  );
}
