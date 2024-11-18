import '../Auth.css';
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Logger } from '../../../utils/logger';
import { useAuth } from '../../../contexts/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CustomInput } from '../../../components/Custom/Input';
import { CustomButton } from '../../../components/Button/Button';
import { Grid } from '@mui/material';

const log = new Logger('ResetPasswordScreen');

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
  const { confirmPasswordReset, userType } = useAuth();

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
        navigate(`/app/${userType}`);
      } catch (error) {
        log.error(error, { detail: 'Failed to complete password reset' });
      } finally {
        setLoading(false);
      }
    },
    [confirmPasswordReset, email, userType, code, password, navigate]
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
        <div className="form-label">Email</div>
        <CustomInput
          placeholder="Enter your email"
          value={email}
          type="email"
          onChange={handleChangeEmail}
        />
      </Grid>
      <Grid item xs={12}>
        <div className="form-label">Code</div>
        <CustomInput
          placeholder="Enter the code you received in your email"
          value={code}
          onChange={handleChangeCode}
        />
      </Grid>
      <Grid item xs={12}>
        <div className="form-label">Password</div>
        <CustomInput
          placeholder="Enter your new password"
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
                    className={satisfied ? 'Auth-password-complete' : 'Auth-password-incomplete'}
                  />
                  <p className="Auth-password-requirement">Contains at least {requirement}</p>
                </div>
              );
            })
          : null}
      </Grid>
      <Grid item xs={12}>
        <div className="form-label">Confirm Password</div>
        <CustomInput
          placeholder="Confirm your new password"
          value={confirmPassword}
          type="password"
          onChange={handleChangeConfirmPassword}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomButton
          type="primary"
          onClick={handleResetPassword}
          disabled={disabled}
          loading={loading}
          style={{
            width: '100%',
          }}
        >
          Reset Password
        </CustomButton>
      </Grid>
      <Grid item xs={12}>
        <Link to="/sign-in">
          <div className="Auth-link-centered">Already have an account? Sign in.</div>
        </Link>
        <Link to="/sign-up">
          <div className="Auth-link-centered">Need to create an account? Sign up.</div>
        </Link>
      </Grid>
    </Grid>
  );
}
