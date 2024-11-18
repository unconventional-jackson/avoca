import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { changePasswordView } from './changePassword';
import { forgotPasswordView } from './forgotPassword';
import { refreshTokenView } from './refreshToken';
import { resendVerificationView } from './resendVerification';
import { resetPasswordView } from './resetPassword';
import { signInView } from './signIn';
import { signUpView } from './signUp';
import { totpSetupView } from './totpSetup';
import { totpVerifyView } from './totpVerify';
import { verifyEmailView } from './verifyEmail';

export const authRoutes = Router();

authRoutes.post('/signup', asyncHandler(signUpView));
authRoutes.post('/signin', asyncHandler(signInView));
authRoutes.post('/forgot-password', asyncHandler(forgotPasswordView));
authRoutes.post('/reset-password', asyncHandler(resetPasswordView));
authRoutes.post('/change-password', asyncHandler(changePasswordView));
authRoutes.post('/verify-email', asyncHandler(verifyEmailView));
authRoutes.post('/resend-verification', asyncHandler(resendVerificationView));
authRoutes.post('/totp/setup', asyncHandler(totpSetupView));
authRoutes.post('/totp/verify', asyncHandler(totpVerifyView));
authRoutes.post('/refresh-token', asyncHandler(refreshTokenView));
