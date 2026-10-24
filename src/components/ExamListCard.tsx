import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Badge } from './ui/Badge';
import type { ExamConfig } from '@/types/api';

interface ExamListCardProps {
  exam: ExamConfig;
  onPress: () => void;
}

export function ExamListCard({ exam, onPress }: ExamListCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{exam.title}</Text>
        <Badge label={exam.examType === 'mock' ? 'Mock Test' : 'Practice'} tone={exam.examType === 'mock' ? 'danger' : 'neutral'} />
      </View>
      <Text style={styles.meta}>
        {exam.examType === 'mock'
          ? `${exam.totalQuestions} questions · ${exam.duration} min` +
            (exam.negativeMarks > 0 ? ` · +${exam.correctMarks}/-${exam.negativeMarks}` : ` · no negative marking`)
          : `${exam.totalQuestions} questions · instant feedback, no timer`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  title: { ...typography.subtitle, flexShrink: 1, marginRight: spacing.sm },
  meta: { ...typography.caption, color: colors.textMuted },
});