import { apiRequest } from './client';
import type { AuthTokens, UserProfile } from '@/types/api';

export function register(input: { name: string; email: string; phone: string; password: string }) {
  return apiRequest<{ userId: string }>('/api/auth/register', { method: 'POST', body: input, auth: false });
}

export function verifyOtp(input: { userId: string; otp: string }) {
  return apiRequest<AuthTokens>('/api/auth/verify-otp', { method: 'POST', body: input, auth: false });
}

export function resendOtp(input: { userId: string }) {
  return apiRequest<{ message: string }>('/api/auth/resend-otp', { method: 'POST', body: input, auth: false });
}

export function login(input: { email: string; password: string }) {
  return apiRequest<AuthTokens>('/api/auth/login', { method: 'POST', body: input, auth: false });
}

export function logout(refreshToken: string) {
  return apiRequest<{ message: string }>('/api/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
}

export function getMe() {
  return apiRequest<UserProfile>('/api/auth/me');
}
// Add these three functions into your existing src/api/auth.ts, alongside
// login/register/verifyOtp/etc. `apiRequest` is already imported there.

export function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiRequest<{ message: string }>('/api/auth/change-password', { method: 'POST', body: input });
}

export function forgotPassword(input: { email: string }) {
  return apiRequest<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

export function resetPassword(input: { email: string; otp: string; newPassword: string }) {
  return apiRequest<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: input,
    auth: false,
  });
}