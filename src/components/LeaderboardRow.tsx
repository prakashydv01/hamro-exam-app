import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import type { LeaderboardEntry } from '@/types/api';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  return (
    <View style={[styles.row, isCurrentUser && styles.highlighted]}>
      <Text style={styles.rank}>#{entry.rank}</Text>
      <Text style={styles.name} numberOfLines={1}>{entry.name}</Text>
      <Text style={styles.score}>{entry.score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  highlighted: { backgroundColor: '#eff6ff' },
  rank: { width: 40, ...typography.body, fontWeight: '700', color: colors.textMuted },
  name: { flex: 1, ...typography.body },
  score: { ...typography.subtitle, color: colors.primary },
});
