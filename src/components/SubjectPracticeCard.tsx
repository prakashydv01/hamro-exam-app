import { Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { ExamConfig } from '@/types/api';

interface SubjectPracticeCardProps {
  exam: ExamConfig;
  onPress: () => void;
  starting: boolean;
  disabled: boolean;
}

export function SubjectPracticeCard({ exam, onPress, starting, disabled }: SubjectPracticeCardProps) {
  const subjectName = exam.subjectId?.name ?? exam.title;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.card, pressed && !disabled && styles.pressed, disabled && !starting && styles.disabled]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={exam.chapterWise ? 'list-outline' : 'book-outline'} size={20} color={colors.primary} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{subjectName}</Text>
        <Text style={styles.meta}>
          {exam.chapterWise ? 'Chapter-wise · pick a chapter' : `${exam.totalQuestions} questions · instant feedback`}
        </Text>
      </View>
      {starting ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textBlock: { flex: 1 },
  title: { ...typography.subtitle, marginBottom: 2 },
  meta: { ...typography.caption, color: colors.textMuted },
});