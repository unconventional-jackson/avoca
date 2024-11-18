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
import { Config } from './config';

import { ChangePasswordScreen } from './screens/auth/ChangePassword';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersistor, queryClient } from './api/client';
import { TotpSetupScreen } from './screens/auth/TotpSetup';
import { TotpVerifyScreen } from './screens/auth/TotpVerify';
import SwaggerJson from '@unconventional-code/avoca-takehome-api/swagger.json';
import { PageLayout } from './components/PageLayout/PageLayout';
import { MainContent } from './components/MainContent/MainContent';
import { DebugContextProvider } from './contexts/DebugContext';
import { AuthContainer } from './screens/auth/AuthContainer/AuthContainer';
import { NavigationLayout } from './navigation/NavigationLayout';

console.log({ Config });
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
                  <Route
                    path="admin"
                    element={
                      <NavigationLayout>
                        <Outlet />
                      </NavigationLayout>
                    }
                  >
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
            </AuthProvider>
          </DebugContextProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </PersistQueryClientProvider>
  );
}
