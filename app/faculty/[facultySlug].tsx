import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useExams } from '@/hooks/useExams';
import { startExam } from '@/api/exams';
import { ApiError } from '@/api/client';
import { prefetchExamImages } from '@/utils/cloudinary';
import { ExamListCard } from '@/components/ExamListCard';
import { SubjectPracticeCard } from '@/components/SubjectPracticeCard';
import { colors, spacing, typography, radius } from '@/constants/theme';
import type { ExamConfig } from '@/types/api';

type FilterType = 'practice' | 'mock';

export default function FacultyScreen() {
  const { facultySlug } = useLocalSearchParams<{ facultySlug: string }>();
  const [filter, setFilter] = useState<FilterType>('practice');
  const [startingId, setStartingId] = useState<string | null>(null);

  const { data: exams, isLoading } = useExams(facultySlug, filter);

  // Practice needs no confirmation step (no timer, nothing at stake) - tap
  // a subject and go straight in, skipping the exam-detail screen entirely.
  // We fetch here (rather than letting practice.tsx fetch on mount) so a
  // failure shows inline on this screen instead of after navigating away,
  // and pass the result along via params so practice.tsx doesn't re-fetch
  // and get a second, different random question set.
  async function handlePracticePress(exam: ExamConfig) {
    if (startingId) return; // ignore taps while another card is already starting

    // Chapter-wise subject: show the subject with its chapters underneath and
    // let the student choose. Otherwise start straight away (as before).
    if (exam.chapterWise) {
      router.push({
        pathname: '/exam/[examId]/chapters',
        params: {
          examId: exam._id,
          subjectName: exam.subjectId?.name ?? exam.title,
          totalQuestions: String(exam.totalQuestions),
        },
      });
      return;
    }

    setStartingId(exam._id);
    try {
      const res = await startExam(exam._id);
      // Start loading images now, while the user is still looking at this
      // list - by the time the practice screen mounts a moment later, the
      // first question's images may already be cached.
      prefetchExamImages(res.questions);
      const subjectName = exam.subjectId?.name ?? exam.title;
      router.push({
        pathname: '/exam/[examId]/practice',
        params: { examId: exam._id, dataJson: JSON.stringify(res), subjectName },
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not start practice. Please try again.';
      Alert.alert('Unable to start practice', message);
    } finally {
      setStartingId(null);
    }
  }

  // Mock keeps the existing detail-screen flow (duration warning, marking
  // scheme, leaderboard link) since starting one is a bigger commitment.
  function handleMockPress(exam: ExamConfig) {
    router.push({
      pathname: '/exam/[examId]',
      params: { examId: exam._id, examJson: JSON.stringify(exam) },
    });
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: facultySlug?.toUpperCase(), headerBackTitle: 'Back' }} />

      <View style={styles.tabRow}>
        <FilterTab label="Practice" active={filter === 'practice'} onPress={() => setFilter('practice')} />
        <FilterTab label="Mock Tests" active={filter === 'mock'} onPress={() => setFilter('mock')} />
      </View>

      {filter === 'practice' && (
        <Text style={styles.hint}>Pick a subject to start practicing - no timer, answers shown instantly.</Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={exams ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.muted}>
              {filter === 'practice' ? 'No practice subjects available yet.' : 'No mock exams available yet.'}
            </Text>
          }
          renderItem={({ item }) =>
            filter === 'practice' ? (
              <SubjectPracticeCard
                exam={item}
                onPress={() => handlePracticePress(item)}
                starting={startingId === item._id}
                disabled={startingId !== null}
              />
            ) : (
              <ExamListCard exam={item} onPress={() => handleMockPress(item)} />
            )
          }
        />
      )}
    </View>
  );
}

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  list: { paddingBottom: spacing.xxl },
  muted: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg },
});