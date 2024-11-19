import './Auth.css';

import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Config } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { Grid, TextField } from '@mui/material';
import { parseAxiosError } from '../../utils/errors';
import { LoadingButton } from '@mui/lab';

// Defined outside of the component to avoid re-creating the object on every render
const requirements = {
  '8 characters': /.{8,}/,
  '1 number': /\d/,
  '1 special character': /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/,
  '1 uppercase letter': /[A-Z]/,
  '1 lowercase letter': /[a-z]/,
};

export function SignUpScreen() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const handleChangeEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
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
  const handleSignUp = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoading(true);
        await signUp(email.toLowerCase(), password);
        // Before navigating, send a verification email
        navigate('/verify-email');
      } catch (error) {
        toast.error(`Failed to create account: ${parseAxiosError(error)}`);
      } finally {
        setLoading(false);
      }
    },
    [email, password, signUp, navigate]
  );

  const emailExists = useMemo(() => /^.+@.+\..+$/.test(email), [email]);
  const emailValid = useMemo(() => {
    if (['dev', 'local'].includes(Config.ENV) && !/\w+@unconventionalcode\.com$/.test(email)) {
      return false;
    }
    return true;
  }, [email]);

  const passwordsMatch = useMemo(
    () => password && confirmPassword && password === confirmPassword,
    [password, confirmPassword]
  );

  const passwordValid = useMemo(
    () => Object.values(requirements).every((regex) => regex.test(password)),
    [password]
  );

  const disabled = useMemo(
    () => !emailValid || !passwordValid || !passwordsMatch,
    [emailValid, passwordValid, passwordsMatch]
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
        />
        {emailExists ? (
          <div className="Auth-password-requirement-container">
            <FontAwesomeIcon
              icon={emailValid ? faCheck : faTimes}
              className={emailValid ? 'Auth-complete' : 'Auth-incomplete'}
            />
            <p className="Auth-password-requirement">Email must be valid</p>
          </div>
        ) : null}
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Password"
          placeholder="Enter your password"
          value={password}
          type="password"
          onChange={handleChangePassword}
        />
        {password
          ? Object.entries(requirements).map(([requirement, regex], index) => {
              const satisfied = regex.test(password);
              return (
                <div className="Auth-password-requirement-container" key={index}>
                  <FontAwesomeIcon
                    icon={satisfied ? faCheck : faTimes}
                    className={satisfied ? 'Auth-complete' : 'Auth-incomplete'}
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
          placeholder="Confirm your password"
          type="password"
          value={confirmPassword}
          onChange={handleChangeConfirmPassword}
        />
        {confirmPassword ? (
          <div className="Auth-password-requirement-container">
            <FontAwesomeIcon
              icon={passwordsMatch ? faCheck : faTimes}
              className={passwordsMatch ? 'Auth-complete' : 'Auth-incomplete'}
            />
            <p className="Auth-password-requirement">Passwords must match</p>
          </div>
        ) : null}
      </Grid>
      <Grid item xs={12}>
        <LoadingButton
          variant="contained"
          onClick={handleSignUp}
          disabled={disabled}
          loading={loading}
          style={{
            width: '100%',
          }}
        >
          Create Account
        </LoadingButton>
      </Grid>
      <Grid item xs={12}>
        <Link to="/sign-in">
          <div className="Auth-link-centered">Already have an account? Sign in.</div>
        </Link>
      </Grid>
    </Grid>
  );
}
