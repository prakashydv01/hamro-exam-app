import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

interface ExamTimerProps {
  startedAt: string; // ISO timestamp
  durationMinutes: number;
  onExpire: () => void;
}

/**
 * This is a client-side convenience countdown only - it drives when the
 * app auto-submits from the user's perspective, but the actual time-limit
 * enforcement happens server-side in /api/attempts/submit (see backend's
 * attempt.service.ts DURATION_GRACE_SECONDS check). If this timer is off
 * by a few seconds due to clock drift, the server is still the source of
 * truth, so nothing breaks - the exam just might submit slightly early/late
 * from the user's point of view.
 */
export function ExamTimer({ startedAt, durationMinutes, onExpire }: ExamTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => computeRemaining(startedAt, durationMinutes));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = computeRemaining(startedAt, durationMinutes);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes, onExpire]);

  const minutes = Math.floor(Math.max(remainingSeconds, 0) / 60);
  const seconds = Math.max(remainingSeconds, 0) % 60;
  const isLow = remainingSeconds <= 60;

  return (
    <Text style={[styles.timer, isLow && styles.timerLow]}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </Text>
  );
}

function computeRemaining(startedAt: string, durationMinutes: number): number {
  const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  return durationMinutes * 60 - elapsedSeconds;
}

const styles = StyleSheet.create({
  timer: { ...typography.subtitle, color: colors.text, fontVariant: ['tabular-nums'] },
  timerLow: { color: colors.danger },
});
