import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/useAuth';
import { useEffect, useMemo } from 'react';
import { Logger } from '../utils/logger';
import { toast } from 'react-toastify';

const log = new Logger('RestrictedNavigation');
export function RestrictedNavigation() {
  const { authUser, initialized } = useAuth();

  const location = useLocation();
  const params = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);

    /**
     * Error callback
     * http://localhost:5173/login/callback?error_description=Invalid+SAML+response+received%3A+PreSignUp+failed+with+error+Invalid+email+domain.+&error=server_error
     */
    const errorDescription = searchParams.get('error_description');
    const code = searchParams.get('code');
    log.info('Login callback', { errorDescription, code });
    return {
      errorDescription,
      code,
    };
  }, [location.search]);

  useEffect(() => {
    if (params.errorDescription) {
      toast.error(params.errorDescription);
    }
  }, [params.errorDescription]);
  if (params.errorDescription) {
    return <Navigate to="/authenticate" />;
  }

  if (!!authUser) {
    if (authUser?.type === 'admin' || authUser?.type === 'operator') {
      if (!authUser?.authEmailVerified) {
        return <Navigate to="/verify-email" />;
      }

      if (!authUser?.authTotpEnabled) {
        return <Navigate to="/totp-setup" />;
      }

      if (!authUser?.authTotpVerifiedAt) {
        return <Navigate to="/totp-verify" />;
      }
    } else if (authUser?.type === 'user') {
      if (!authUser?.authEmailVerified) {
        return <Navigate to="/authenticate" />;
      }

      if (!authUser?.authTotpVerifiedAt) {
        return <Navigate to="/authenticate-verify" />;
      }
    }

    return <Outlet />;
  }

  // /**
  //  * Fallback for a race condition on SSO callbacks
  //  * taking too long to be verified
  //  */
  if (!initialized) {
    return null;
  }

  return <Navigate to="/authenticate" />;
}
