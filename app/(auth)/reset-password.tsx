import { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { resetPassword, forgotPassword } from '@/api/auth';
import { ApiError } from '@/api/client';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleReset() {
    setError(null);
    setInfo(null);

    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await forgotPassword({ email });
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code. Please wait and try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Enter the code sent to {email} and choose a new password.</Text>

      <TextField
        label="Verification code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="123456"
      />
      <TextField
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder="At least 8 characters"
      />
      <TextField
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholder="Re-enter new password"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      <Button title="Reset password" onPress={handleReset} loading={loading} fullWidth />
      <Button
        title={resending ? 'Sending…' : 'Resend code'}
        onPress={handleResend}
        variant="outline"
        loading={resending}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background, gap: spacing.md },
  title: { ...typography.title, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  error: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  info: { color: colors.success, fontSize: 13, textAlign: 'center' },
});
