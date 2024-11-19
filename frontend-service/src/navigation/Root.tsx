import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Root() {
  const { authUser } = useAuth();
  if (authUser?.employee_id) {
    return <Navigate to="/app" />;
  }

  return <Navigate to="/sign-in" />;
}
