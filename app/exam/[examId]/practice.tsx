import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { startExam } from '@/api/exams';
import { ApiError } from '@/api/client';
import { OptionList } from '@/components/exam/OptionList';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { MathText } from '@/components/ui/MathText';
import { warmUpMath } from '@/utils/mathRender';
import { prefetchExamImages } from '@/utils/cloudinary';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { ExamQuestion } from '@/types/api';

/**
 * Practice mode is entirely local: no timer, answers reveal immediately on
 * tap, and nothing is ever sent to the backend beyond the initial
 * /api/exams/start call that fetches the questions.
 */
export default function PracticeExamScreen() {
  const { examId, dataJson, subjectName: subjectNameParam } = useLocalSearchParams<{
    examId: string;
    dataJson?: string;
    subjectName?: string;
  }>();

  const [loading, setLoading] = useState(!dataJson);
  const [title, setTitle] = useState(() => (dataJson ? JSON.parse(dataJson).title : ''));
  const [questions, setQuestions] = useState<ExamQuestion[]>(() =>
    dataJson ? JSON.parse(dataJson).questions : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({}); // questionId -> selectedOptionId
  const [finished, setFinished] = useState(false);

  const subjectName = subjectNameParam || title;

  useEffect(() => {
    // Load the math engine now (cheap no-op work if nothing uses it) so the first formula doesn't stall.
    setTimeout(warmUpMath, 0);

    // dataJson (when present) is already parsed synchronously above during
    // state initialization, and its images were already prefetched one
    // screen earlier (faculty screen). Still worth firing again here -
    // expo-image's prefetch is cheap/idempotent if already cached, and this
    // covers the case where dataJson exists but wasn't prefetched upstream.
    if (dataJson) {
      prefetchExamImages(questions);
      return;
    }

    // Fallback path: reaching this screen without going through the
    // faculty screen's pre-fetch (e.g. a future deep link).
    startExam(examId)
      .then((res) => {
        setTitle(res.title);
        setQuestions(res.questions);
        prefetchExamImages(res.questions);
      })
      .catch((err) => {
        Alert.alert(
          'Could not load practice questions',
          err instanceof ApiError ? err.message : 'Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!finished && questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No questions available for this subject right now.</Text>
        <Button title="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  if (finished) {
    const correctCount = questions.filter((q) => selections[q.questionId] === q.correctOptionId).length;
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Practice Result', headerBackVisible: false }} />
        <Card style={styles.summaryCard}>
          <Text style={styles.summarySubject}>{subjectName}</Text>
          <Text style={styles.summaryScore}>{correctCount} / {questions.length}</Text>
          <Text style={styles.summaryLabel}>correct</Text>
          <Text style={styles.summaryNote}>This practice session wasn't saved - retake it anytime for a fresh set of questions.</Text>
        </Card>
        <Button title="Back to exams" onPress={() => router.back()} fullWidth />
      </View>
    );
  }

  const question = questions[currentIndex];
  const selectedOptionId = selections[question.questionId];
  const hasAnswered = !!selectedOptionId;
  const isLast = currentIndex === questions.length - 1;

  function selectOption(optionId: string) {
    if (hasAnswered) return; // lock in the first choice, matches typical practice-quiz UX
    setSelections((prev) => ({ ...prev, [question.questionId]: optionId }));
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: subjectName, headerBackTitle: 'Back' }} />

      <View style={styles.header}>
        <Text style={styles.subjectLabel}>{subjectName}</Text>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.progress}>Question {currentIndex + 1} of {questions.length}</Text>
        <MathText style={styles.question}>{question.question}</MathText>
        {question.imageUrl ? (
          <RemoteImage uri={question.imageUrl} maxHeight={220} framed style={styles.questionImage} />
        ) : null}

        <OptionList
          options={question.options}
          selectedOptionId={selectedOptionId}
          onSelect={selectOption}
          getReviewState={
            hasAnswered
              ? (id) => (id === question.correctOptionId ? 'correct' : id === selectedOptionId ? 'incorrect' : 'none')
              : undefined
          }
        />

        {hasAnswered && question.explanation ? (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationLabel}>Explanation</Text>
            <MathText style={styles.explanationText}>{question.explanation}</MathText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Previous"
          variant="outline"
          onPress={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        />
        {isLast ? (
          <Button title="Finish" onPress={() => setFinished(true)} disabled={!hasAnswered} />
        ) : (
          <Button title="Next" onPress={() => setCurrentIndex((i) => i + 1)} disabled={!hasAnswered} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.md },
  muted: { color: colors.textMuted, fontSize: 13 },
  header: { padding: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  subjectLabel: { ...typography.caption, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  body: { flex: 1 },
  bodyContent: { padding: spacing.lg },
  progress: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  question: { ...typography.subtitle, marginBottom: spacing.md, lineHeight: 22 },
  questionImage: { marginBottom: spacing.md },
  explanationBox: { marginTop: spacing.sm, padding: spacing.md, backgroundColor: colors.background, borderRadius: 8 },
  explanationLabel: { ...typography.caption, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  explanationText: { fontSize: 13, color: colors.text, lineHeight: 19 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryCard: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.xl },
  summarySubject: { ...typography.caption, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  summaryScore: { fontSize: 40, fontWeight: '800', color: colors.primary },
  summaryLabel: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
  summaryNote: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});