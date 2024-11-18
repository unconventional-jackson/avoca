import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export function Root() {
  const { authUser } = useAuth();
  console.log({ authUser });
  if (authUser?.userId) {
    return <Navigate to="/app" />;
  }

  return <Navigate to="/authenticate" />;
}
