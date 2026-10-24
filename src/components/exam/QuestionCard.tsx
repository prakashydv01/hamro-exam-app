import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { OptionList } from './OptionList';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { MathText } from '@/components/ui/MathText';
import type { ExamOption } from '@/types/api';

interface QuestionCardProps {
  index: number;
  total: number;
  question: string;
  imageUrl?: string;
  options: ExamOption[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  /** Only passed on the review screen. */
  correctOptionId?: string;
  explanation?: string;
}

export function QuestionCard({
  index,
  total,
  question,
  imageUrl,
  options,
  selectedOptionId,
  onSelect,
  correctOptionId,
  explanation,
}: QuestionCardProps) {
  const isReview = !!correctOptionId;

  return (
    <View>
      <Text style={styles.progress}>Question {index + 1} of {total}</Text>
      <MathText style={styles.question}>{question}</MathText>
      {imageUrl ? <RemoteImage uri={imageUrl} maxHeight={220} framed style={styles.questionImage} /> : null}

      <OptionList
        options={options}
        selectedOptionId={selectedOptionId}
        onSelect={onSelect}
        getReviewState={
          isReview
            ? (id) => (id === correctOptionId ? 'correct' : id === selectedOptionId ? 'incorrect' : 'none')
            : undefined
        }
      />

      {isReview && explanation ? (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationLabel}>Explanation</Text>
          <MathText style={styles.explanationText}>{explanation}</MathText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  question: { ...typography.subtitle, marginBottom: spacing.md, lineHeight: 22 },
  questionImage: { marginBottom: spacing.md },
  explanationBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  explanationLabel: { ...typography.caption, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  explanationText: { fontSize: 13, color: colors.text, lineHeight: 19 },
});