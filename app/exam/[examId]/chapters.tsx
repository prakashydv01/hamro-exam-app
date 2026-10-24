import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getExamChapters, startExam } from '@/api/exams';
import { ApiError } from '@/api/client';
import { prefetchExamImages } from '@/utils/cloudinary';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/constants/theme';

/**
 * Chapter picker for chapter-wise practice subjects: the subject name on top,
 * its chapters underneath. Tapping a chapter (or "All chapters") starts
 * practice immediately - same flow as a normal subject.
 */
export default function PracticeChaptersScreen() {
  const { examId, subjectName = 'Practice' } = useLocalSearchParams<{
    examId: string;
    subjectName?: string;
    totalQuestions?: string;
  }>();

  const [startingKey, setStartingKey] = useState<string | null>(null);

  const { data: chapters, isLoading, isError, refetch } = useQuery({
    queryKey: ['exam-chapters', examId],
    queryFn: () => getExamChapters(examId),
    staleTime: 1000 * 60 * 10,
    enabled: !!examId,
  });

  async function begin(key: string, chapter?: string) {
    if (startingKey) return;
    setStartingKey(key);
    try {
      const res = await startExam(examId, chapter);
      prefetchExamImages(res.questions);
      router.push({
        pathname: '/exam/[examId]/practice',
        params: {
          examId,
          dataJson: JSON.stringify(res),
          subjectName: chapter ? `${subjectName} · ${chapter}` : subjectName,
        },
      });
    } catch (err) {
      Alert.alert('Unable to start practice', err instanceof ApiError ? err.message : 'Please try again.');
    } finally {
      setStartingKey(null);
    }
  }

  const rows = [{ key: '__all__', label: 'All chapters', sub: 'Mixed questions from the whole subject', chapter: undefined as string | undefined }].concat(
    (chapters ?? []).map((c) => ({
      key: c.chapter,
      label: c.chapter,
      sub: `${c.count} question${c.count === 1 ? '' : 's'}`,
      chapter: c.chapter,
    }))
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: subjectName, headerBackTitle: 'Back' }} />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="library-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.subject}>{subjectName}</Text>
          <Text style={styles.caption}>Choose a chapter to practice</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Could not load chapters.</Text>
          <Button title="Retry" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.key}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const starting = startingKey === item.key;
            const disabled = startingKey !== null && !starting;
            return (
              <Pressable
                onPress={() => begin(item.key, item.chapter)}
                disabled={startingKey !== null}
                style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                {starting ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                )}
              </Pressable>
            );
          }}
          ListFooterComponent={
            chapters && chapters.length === 0 ? (
              <Text style={styles.muted}>No chapters have been added for this subject yet.</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subject: { ...typography.title },
  caption: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  row: {
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
  rowTitle: { ...typography.subtitle, marginBottom: 2 },
  rowSub: { ...typography.caption, color: colors.textMuted },
  center: { alignItems: 'center', gap: spacing.md, marginTop: spacing.xl },
  muted: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg, textAlign: 'center' },
});