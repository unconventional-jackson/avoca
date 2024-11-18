import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useSdk } from '../api/sdk';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuthUser, UserType } from '@unconventional-code/avoca-takehome-api';

interface AuthContextProps {
  authUser: AuthUser | null;
  initialized: boolean;
  userType: UserType;
  setUserType: (userType: UserType) => void;
  authenticate: (email: string) => Promise<void>;
  authenticateVerify: (email: string, token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeNewPassword: (newPassword: string, token: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  totpSetup: (email: string) => Promise<{ otpauth_url?: string }>;
  totpVerify: (email: string, totpCode: string) => Promise<void>;
}

// Create the AuthContext with initial values
export const AuthContext = createContext<AuthContextProps>({
  authUser: null,
  initialized: false,
  userType: UserType.User,
  setUserType: () => {},
  authenticate: async () => Promise.resolve(),
  authenticateVerify: async () => Promise.resolve(),
  signIn: async () => Promise.resolve(),
  signUp: async () => Promise.resolve(),
  signOut: async () => Promise.resolve(),
  completeNewPassword: async () => Promise.resolve(),
  changePassword: async () => Promise.resolve(),
  requestPasswordReset: async () => Promise.resolve(),
  confirmPasswordReset: async () => Promise.resolve(),
  resendVerification: async () => Promise.resolve(),
  verifyEmail: async () => Promise.resolve(),
  totpSetup: async () => Promise.resolve({ otpauth_url: '' }),
  totpVerify: async () => Promise.resolve(),
});

export function AuthProvider({ children }: PropsWithChildren<unknown>) {
  const apiSdk = useSdk();
  const queryClient = useQueryClient();
  // Set an initializing state whilst Cognito / Amplify connects
  const [authUser, setAuthUser] = useLocalStorage<AuthUser | null>('user', null);
  const [initialized, setInitialized] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.User);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    await apiSdk.signUp({
      email,
      password,
      userType,
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await apiSdk.signIn({
      email,
      password,
      userType,
    });
    if (response.data.user) {
      setAuthUser(response.data.user);
    }
  }, []);

  const completeNewPassword = useCallback(async (newPassword: string, token: string) => {
    await apiSdk.resetPassword({
      newPassword,
      token,
      userType,
    });
  }, []);
  const resendVerification = useCallback(async (email: string) => {
    await apiSdk.resendVerification({ email, userType });
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    // Make a POST request to the verify email api
    const response = await apiSdk.verifyEmail({
      email,
      token: code,
      userType,
    });
    if (response.data.user) {
      setAuthUser(response.data.user);
    }
  }, []);

  const totpSetup = useCallback(async (email: string) => {
    const response = await apiSdk.totpSetup({ email, userType });

    // should contain `otpauth_url`
    return response.data;
  }, []);

  const totpVerify = useCallback(async (email: string, totpCode: string) => {
    const response = await apiSdk.totpVerify({ email, token: totpCode, userType });
    if (response.data.user) {
      setAuthUser(response.data.user);
    }
  }, []);

  const signOut = useCallback(async () => {
    //navigate to /
    queryClient.clear();
    localStorage.clear();
    setAuthUser(null);
  }, [queryClient]);

  const requestPasswordReset = useCallback(async (email: string) => {
    await apiSdk.forgotPassword({
      email,
      userType,
    });
  }, []);

  // reset password
  const confirmPasswordReset = useCallback(
    async (email: string, code: string, password: string) => {
      // Make a POST request to the reset password API
      await apiSdk.resetPassword({
        newPassword: password,
        token: code, // using code as the token
        userType,
      });
    },
    []
  );

  /**
   * Changes a signed-in user's password
   */
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!authUser?.email) {
      throw new Error('User is not signed in');
    }
    await apiSdk.changePassword({
      email: authUser?.email,
      currentPassword: oldPassword,
      newPassword,
      userType,
    });
  }, []);

  /**
   * For users only: authenticate with email
   */
  const authenticate = useCallback(async (email: string) => {
    await apiSdk.authenticate({ email, userType });
  }, []);

  /**
   * For users only: verify authentication with code
   */
  const authenticateVerify = useCallback(async (email: string, token: string) => {
    const response = await apiSdk.authenticateVerify({ email, token, userType });
    if (response.data.user) {
      setAuthUser(response.data.user);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        initialized,
        userType,
        setUserType,
        authenticate,
        authenticateVerify,
        signIn,
        signUp,
        signOut,
        completeNewPassword,
        changePassword,
        requestPasswordReset,
        confirmPasswordReset,
        resendVerification,
        verifyEmail,
        totpSetup,
        totpVerify,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
