import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { MathText } from '@/components/ui/MathText';
import type { ExamOption } from '@/types/api';

interface OptionButtonProps {
  option: ExamOption;
  selected: boolean;
  onPress: () => void;
  /** Only passed once the answer is revealed - shows correct/incorrect coloring. */
  reviewState?: 'correct' | 'incorrect' | 'none';
  /** Smaller tile, used when image options are laid out in a 2-column grid. */
  compact?: boolean;
  /** A, B, C, D... based on the option's ACTUAL rendered position (after any
   * shuffling), not anything baked into an image. This is what keeps
   * labeling correct regardless of whether the option is text, an image, or
   * both, and regardless of what order the backend shuffled them into. */
  label?: string;
}

export function OptionButton({ option, selected, onPress, reviewState, compact, label }: OptionButtonProps) {
  const isReview = !!reviewState;
  const hasImage = !!option.imageUrl;
  const hasText = !!option.text;

  return (
    <Pressable
      onPress={isReview ? undefined : onPress}
      style={[
        styles.base,
        compact && styles.compact,
        selected && !isReview && styles.selected,
        reviewState === 'correct' && styles.correct,
        reviewState === 'incorrect' && styles.incorrect,
      ]}
    >
      <View style={styles.row}>
        {label ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{label}</Text>
          </View>
        ) : null}
        <View style={styles.content}>
          {hasImage ? (
            <RemoteImage
              uri={option.imageUrl as string}
              fixedHeight={compact ? 80 : 100}
              style={hasText ? styles.imageWithText : undefined}
            />
          ) : null}
          {hasText ? (
            <MathText style={[styles.text, selected && !isReview && styles.selectedText]}>{option.text}</MathText>
          ) : null}
          {!hasImage && !hasText ? <Text style={styles.emptyText}>(empty option)</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  compact: { padding: spacing.sm },
  selected: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  correct: { borderColor: colors.success, backgroundColor: colors.successBg },
  incorrect: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  content: { flex: 1 },
  text: { fontSize: 14, color: colors.text },
  selectedText: { color: colors.primaryDark, fontWeight: '600' },
  emptyText: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  imageWithText: { marginBottom: spacing.xs },
});