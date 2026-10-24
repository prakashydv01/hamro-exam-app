import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  tone?: 'success' | 'danger' | 'neutral';
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, toneStyles[tone].bg]}>
      <Text style={[styles.text, toneStyles[tone].text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '600' },
});

const toneStyles = {
  success: { bg: { backgroundColor: colors.successBg }, text: { color: colors.success } },
  danger: { bg: { backgroundColor: colors.dangerBg }, text: { color: colors.danger } },
  neutral: { bg: { backgroundColor: colors.background }, text: { color: colors.textMuted } },
};
