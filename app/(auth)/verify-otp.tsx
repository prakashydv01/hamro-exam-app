import { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { resendOtp } from '@/api/auth';
import { ApiError } from '@/api/client';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';

export default function VerifyOtpScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { verifyOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    setError(null);
    setInfo(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(userId, otp);
      // (auth)/_layout redirects to (tabs) automatically once authenticated.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendOtp({ userId });
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code. Please wait and try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code we sent to your email address.</Text>

      <TextField
        label="Verification code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="123456"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      <Button title="Verify" onPress={handleVerify} loading={loading} fullWidth />
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
