import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getAttemptResult } from '@/api/attempts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { colors, spacing, typography } from '@/constants/theme';

export default function ExamResultScreen() {
  const { examId, attemptId } = useLocalSearchParams<{ examId: string; attemptId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['attempt-result', attemptId],
    queryFn: () => getAttemptResult(attemptId),
  });

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const percentage = data.totalQuestions > 0 ? Math.round((data.correct / data.totalQuestions) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerShown: true, title: 'Result', headerBackVisible: false }} />

      <Card style={styles.scoreCard}>
        <Text style={styles.scoreValue}>{data.score}</Text>
        <Text style={styles.scoreLabel}>out of {data.totalQuestions} ({percentage}%)</Text>
        <View style={styles.statsRow}>
          <Stat label="Correct" value={data.correct} color={colors.success} />
          <Stat label="Wrong" value={data.wrong} color={colors.danger} />
          <Stat label="Unanswered" value={data.unanswered} color={colors.textMuted} />
        </View>
      </Card>

      {Object.keys(data.subjectBreakdown).length > 1 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Subject breakdown</Text>
          {Object.entries(data.subjectBreakdown).map(([subjectId, b]) => (
            <View key={subjectId} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subject</Text>
              <Text style={styles.breakdownValue}>{b.correct}/{b.total} correct</Text>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.actionsRow}>
        <Button title="View Leaderboard" variant="outline" onPress={() => router.push(`/leaderboard/${examId}`)} />
        <Button title="Back to Home" onPress={() => router.replace('/(tabs)')} />
      </View>

      <Text style={styles.sectionTitle}>Review</Text>
      {data.review.map((item, index) => (
        <Card key={item.questionId} style={styles.reviewCard}>
          <QuestionCard
            index={index}
            total={data.review.length}
            question={item.question}
            imageUrl={item.imageUrl}
            options={item.options}
            selectedOptionId={item.selectedOptionId}
            onSelect={() => {}}
            correctOptionId={item.correctOptionId}
            explanation={item.explanation}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  scoreCard: { alignItems: 'center', marginBottom: spacing.md },
  scoreValue: { fontSize: 40, fontWeight: '800', color: colors.primary },
  scoreLabel: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.sm },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12, color: colors.textMuted },
  card: { marginBottom: spacing.md },
  sectionTitle: { ...typography.subtitle, marginTop: spacing.md, marginBottom: spacing.sm },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  breakdownLabel: { color: colors.textMuted, fontSize: 13 },
  breakdownValue: { color: colors.text, fontSize: 13, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  reviewCard: { marginBottom: spacing.md },
});