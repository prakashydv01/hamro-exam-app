import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useExamSessionStore } from '@/store/examSessionStore';
import { submitAttempt } from '@/api/attempts';
import { ApiError } from '@/api/client';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';

export default function TakeExamScreen() {
  const { examId, attemptId } = useLocalSearchParams<{ examId: string; attemptId?: string }>();
  const session = useExamSessionStore();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Runs once on mount: either the store already has this exam loaded
  // (normal flow, coming straight from the "Start exam" button), or the
  // store is empty because the app was relaunched - in which case we try
  // restoring the last persisted session from AsyncStorage.
  useEffect(() => {
    async function init() {
      if (session.attemptId && session.examId === examId) {
        setReady(true);
        return;
      }

      const idToRestore = attemptId ?? session.attemptId;
      if (idToRestore) {
        const restored = await session.restoreSession(idToRestore);
        setReady(restored);
        if (!restored) {
          Alert.alert('Session not found', 'This exam session could not be restored.', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') },
          ]);
        }
      } else {
        router.replace('/(tabs)');
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = session.buildSubmitPayload();
      const result = await submitAttempt(payload.attemptId, payload.answers);
      await session.clearSession();
      router.replace({ pathname: '/exam/[examId]/result', params: { examId, attemptId: result.attemptId } });
    } catch (err) {
      Alert.alert('Submission failed', err instanceof ApiError ? err.message : 'Please try again.');
      setSubmitting(false);
    }
  }

  function confirmSubmit() {
    const answeredCount = Object.keys(session.answers).length;
    Alert.alert(
      'Submit exam?',
      `You've answered ${answeredCount} of ${session.questions.length} questions. You can't change answers after submitting.`,
      [
        { text: 'Review again', style: 'cancel' },
        { text: 'Submit', onPress: handleSubmit },
      ]
    );
  }

  if (!ready || session.questions.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];
  const isLast = session.currentIndex === session.questions.length - 1;
  const answeredCount = Object.keys(session.answers).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />
        <View style={styles.headerRow}>
          <Text style={styles.answeredText}>{answeredCount} / {session.questions.length} answered</Text>
          <ExamTimer
            startedAt={session.startedAt as string}
            durationMinutes={session.durationMinutes}
            onExpire={handleSubmit}
          />
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <QuestionCard
          index={session.currentIndex}
          total={session.questions.length}
          question={currentQuestion.question}
          imageUrl={currentQuestion.imageUrl}
          options={currentQuestion.options}
          selectedOptionId={session.answers[currentQuestion.questionId]?.selectedOptionId}
          onSelect={(optionId) => session.selectOption(currentQuestion.questionId, optionId)}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Previous" onPress={session.previous} variant="outline" disabled={session.currentIndex === 0} />
        {isLast ? (
          <Button title="Submit" onPress={confirmSubmit} loading={submitting} />
        ) : (
          <Button title="Next" onPress={session.next} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  answeredText: { fontSize: 13, color: colors.textMuted },
  body: { flex: 1 },
  bodyContent: { padding: spacing.lg },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});