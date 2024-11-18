import '../Auth.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// Defined outside of the component to avoid re-creating the object on every render
const requirements = {
  '8 characters': /.{8,}/,
  '1 number': /\d/,
  '1 special character': /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/,
  '1 uppercase letter': /[A-Z]/,
  '1 lowercase letter': /[a-z]/,
};

export function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const [oldPassword, setOldPassword] = useState<string>('');
  const handleChangeOldPassword = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(event.target.value);
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
  const handleNewPassword = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      try {
        setLoading(true);
        await changePassword(oldPassword, password);
        navigate(`/app`);
      } catch (error) {
        toast.error('Failed to complete password reset');
      }
    },
    [changePassword, password, navigate]
  );

  const disabled = !password || !confirmPassword || password !== confirmPassword;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Current Password"
          placeholder="Enter your current password"
          value={oldPassword}
          type="password"
          onChange={handleChangeOldPassword}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="New Password"
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
        <TextField
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          type="password"
          onChange={handleChangeConfirmPassword}
        />
      </Grid>
      <Grid item xs={12}>
        <LoadingButton
          variant="contained"
          onClick={handleNewPassword}
          disabled={disabled}
          loading={loading}
          style={{
            width: '100%',
          }}
        >
          Set New Password
        </LoadingButton>
      </Grid>
    </Grid>
  );
}
