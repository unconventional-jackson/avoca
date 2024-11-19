import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { NavigationLayout } from './NavigationLayout';

export function RestrictedNavigation() {
  const { authUser, initialized } = useAuth();

  if (!!authUser) {
    if (!authUser?.auth_email_verified) {
      return <Navigate to="/verify-email" />;
    }

    if (!authUser?.auth_totp_enabled) {
      return <Navigate to="/totp-setup" />;
    }

    if (!authUser?.auth_totp_verified_at) {
      return <Navigate to="/totp-verify" />;
    }

    return (
      <NavigationLayout>
        <Outlet />
      </NavigationLayout>
    );
  }

  // /**
  //  * Fallback for a race condition on SSO callbacks
  //  * taking too long to be verified
  //  */
  if (!initialized) {
    return null;
  }

  return <Navigate to="/sign-in" />;
}
