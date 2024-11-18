import '../Auth.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/useAuth';
import { CustomInput } from '../../../components/Custom/Input';
import { CustomButton } from '../../../components/Button/Button';
import { Grid } from '@mui/material';

export function TotpVerifyScreen() {
  const navigate = useNavigate();
  const { authUser, totpVerify, userType } = useAuth();
  const [totpCode, setTotpCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Handle TOTP verification
  const handleTotpVerify = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      if (!authUser?.email) {
        toast.error("User's email is not available for TOTP verification");
        return;
      }
      try {
        setLoading(true);
        await totpVerify(authUser?.email, totpCode); // Pass the email along with the TOTP code
        toast.success('TOTP verified successfully');
        navigate(`/app/${userType}`);
      } catch (error) {
        toast.error('Failed to verify TOTP');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [authUser?.email, userType, totpCode, totpVerify, navigate]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className="form-label">Enter the code from your authenticator app</div>
        <CustomInput
          placeholder="Enter the TOTP code"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <CustomButton
          type="primary"
          onClick={handleTotpVerify}
          loading={loading}
          disabled={!totpCode}
          style={{ width: '100%' }}
        >
          Verify TOTP
        </CustomButton>
      </Grid>
    </Grid>
  );
}
