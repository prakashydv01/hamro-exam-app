import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { startExam } from '@/api/exams';
import { useExamSessionStore } from '@/store/examSessionStore';
import { prefetchExamImages } from '@/utils/cloudinary';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, typography } from '@/constants/theme';
import type { ExamConfig } from '@/types/api';
import { ApiError } from '@/api/client';

export default function ExamDetailScreen() {
  const { examId, examJson } = useLocalSearchParams<{ examId: string; examJson: string }>();
  const exam: ExamConfig = JSON.parse(examJson);
  const startSession = useExamSessionStore((s) => s.startSession);

  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (exam.examType === 'practice') {
      router.push({ pathname: '/exam/[examId]/practice', params: { examId } });
      return;
    }

    setStarting(true);
    try {
      const res = await startExam(examId);
      // Kick off image loading as early as possible - before the take
      // screen even mounts - so by the time the user reaches a question
      // with an image, it's already warm in cache instead of triggering a
      // fresh (slower, first-time Cloudinary transcode) request on screen.
      prefetchExamImages(res.questions);
      await startSession(examId, res);
      router.replace({ pathname: '/exam/[examId]/take', params: { examId } });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not start the exam. Please try again.';
      Alert.alert('Unable to start exam', message);
    } finally {
      setStarting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Exam Details', headerBackTitle: 'Back' }} />

      <Text style={styles.title}>{exam.title}</Text>
      <Badge label={exam.examType === 'mock' ? 'Mock Test' : 'Practice'} tone={exam.examType === 'mock' ? 'danger' : 'neutral'} />

      <Card style={styles.card}>
        <InfoRow label="Questions" value={String(exam.totalQuestions)} />
        {exam.examType === 'mock' && (
          <>
            <InfoRow label="Duration" value={`${exam.duration} minutes`} />
            <InfoRow label="Marks per correct answer" value={`+${exam.correctMarks}`} />
            <InfoRow
              label="Negative marking"
              value={exam.negativeMarks > 0 ? `-${exam.negativeMarks} per wrong answer` : 'None'}
            />
          </>
        )}
      </Card>

      {exam.subjectDistribution && exam.subjectDistribution.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Subject breakdown</Text>
          {exam.subjectDistribution.map((s, i) => (
            <Text key={i} style={styles.breakdownLine}>{s.count} questions</Text>
          ))}
        </Card>
      )}

      {exam.examType === 'mock' && (
        <Text style={styles.notice}>
          Once you start, the timer begins immediately. Make sure you have a stable connection and enough time before starting.
        </Text>
      )}
      {exam.examType === 'practice' && (
        <Text style={styles.notice}>
          No timer, no scoring pressure - see the correct answer right after you pick one. Nothing here is saved.
        </Text>
      )}

      <Button title="Start exam" onPress={handleStart} loading={starting} fullWidth />
      {exam.examType === 'mock' && (
        <View style={{ marginTop: spacing.sm }}>
          <Button title="View Leaderboard" variant="outline" onPress={() => router.push(`/leaderboard/${examId}`)} fullWidth />
        </View>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.title, marginBottom: spacing.sm },
  card: { marginTop: spacing.md, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  infoLabel: { color: colors.textMuted, fontSize: 14 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  sectionLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs, fontWeight: '700' },
  breakdownLine: { fontSize: 13, color: colors.text },
  notice: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 18 },
});