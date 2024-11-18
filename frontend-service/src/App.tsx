import 'swagger-ui-react/swagger-ui.css';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import SwaggerUI from 'swagger-ui-react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { RestrictedNavigation } from './navigation/RestrictedNavigation';
import { Root } from './navigation/Root';
import { SignUpScreen } from './screens/auth/SignUp';
import { VerifyEmailScreen } from './screens/auth/VerifyEmail';
import { ForgotPasswordScreen } from './screens/auth/ForgotPassword';
import { SignInScreen } from './screens/auth/SignIn';
import { ResetPasswordScreen } from './screens/auth/ResetPassword';

import { ChangePasswordScreen } from './screens/auth/ChangePassword';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersistor, queryClient } from './api/client';
import { TotpSetupScreen } from './screens/auth/TotpSetup';
import { TotpVerifyScreen } from './screens/auth/TotpVerify';
import SwaggerJson from '@unconventional-jackson/avoca-internal-api/swagger.json';
import { PageLayout } from './components/PageLayout/PageLayout';
import { MainContent } from './components/MainContent/MainContent';
import { DebugContextProvider } from './contexts/DebugContext';
import { AuthContainer } from './screens/auth/AuthContainer/AuthContainer';
import { PhoneCallsProvider } from './contexts/PhoneCallsContext';
import { Config } from './config';
import { CustomersPage } from './screens/CustomersPage';
import { JobsPage } from './screens/JobsPage';
import { CallsPage } from './screens/CallsPage';

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersistor,
      }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <BrowserRouter>
          <DebugContextProvider>
            <AuthProvider>
              <PhoneCallsProvider url={Config.WS_URL}>
                <Routes>
                  <Route path="/" element={<Root />} />

                  <Route>
                    <Route
                      element={
                        <AuthContainer>
                          <Outlet />
                        </AuthContainer>
                      }
                    >
                      <Route path="sign-in" element={<SignInScreen />} />
                      <Route path="sign-up" element={<SignUpScreen />} />
                      <Route path="verify-email" element={<VerifyEmailScreen />} />
                      <Route path="totp-setup" element={<TotpSetupScreen />} />
                      <Route path="totp-verify" element={<TotpVerifyScreen />} />
                      <Route path="forgot-password" element={<ForgotPasswordScreen />} />
                      <Route path="password-reset" element={<ResetPasswordScreen />} />
                      <Route path="change-password" element={<ChangePasswordScreen />} />
                    </Route>
                  </Route>
                  <Route path="app" element={<RestrictedNavigation />}>
                    <Route index path="calls" element={<CallsPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="jobs" element={<JobsPage />} />
                    <Route
                      path="documentation"
                      element={
                        <PageLayout>
                          <MainContent>
                            <SwaggerUI spec={SwaggerJson} />
                          </MainContent>
                        </PageLayout>
                      }
                    />
                  </Route>
                </Routes>

                <ToastContainer
                  position="top-center"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </PhoneCallsProvider>
            </AuthProvider>
          </DebugContextProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </PersistQueryClientProvider>
  );
}
