import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHome } from '@/hooks/useHome';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/exam/ProgressBar';
import { CategoryGridCard } from '@/components/CategoryGridCard';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { formatRelativeDate } from '@/utils/formatRelativeDate';
import { findAnyInProgressSession, type PersistedExamSession } from '@/utils/examPersistence';
import type { RecentAttemptSummary } from '@/types/api';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useHome();
  const [inProgress, setInProgress] = useState<PersistedExamSession | null>(null);

  useEffect(() => {
    findAnyInProgressSession().then(setInProgress);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const attempts = data?.recentAttempts ?? [];
  const percentages = attempts.map((a) => (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0));
  const avgPct = percentages.length ? Math.round(percentages.reduce((s, v) => s + v, 0) / percentages.length) : null;
  const bestPct = percentages.length ? Math.round(Math.max(...percentages)) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.greetingSmall}>{getGreeting()}, {data?.user.name?.split(' ')[0] ?? 'there'} 👋</Text>
        <Text style={styles.greetingBig}>
          {inProgress ? "Let's finish what you started" : "Let's keep the momentum going"}
        </Text>
      </View>

      <View style={styles.heroCard}>
        {inProgress ? (
          <>
            <Text style={styles.heroLabel}>CONTINUE WHERE YOU LEFT OFF</Text>
            <Text style={styles.heroTitle}>{inProgress.title}</Text>
            <View style={styles.heroProgressRow}>
              <ProgressBar current={inProgress.currentIndex + 1} total={inProgress.questions.length} />
            </View>
            <Text style={styles.heroMeta}>
              Question {inProgress.currentIndex + 1} of {inProgress.questions.length}
            </Text>
            <Button
              title="Resume exam"
              onPress={() =>
                router.push({
                  pathname: '/exam/[examId]/take',
                  params: { examId: inProgress.examId, attemptId: inProgress.attemptId },
                })
              }
              fullWidth
            />
          </>
        ) : (
          <>
            <Text style={styles.heroLabel}>READY WHEN YOU ARE</Text>
            <Text style={styles.heroTitle}>Pick a category below and start practicing</Text>
          </>
        )}
      </View>

      {avgPct !== null && (
        <View style={styles.sectionPad}>
          <View style={styles.statsRow}>
            <StatBlock label={`Last ${attempts.length} avg`} value={`${avgPct}%`} />
            <View style={styles.statDivider} />
            <StatBlock label="Best recent" value={`${bestPct}%`} />
            <View style={styles.statDivider} />
            <StatBlock label="Attempts" value={String(attempts.length)} />
          </View>
        </View>
      )}

      <View style={styles.sectionPad}>
        <Text style={styles.sectionTitle}>Explore categories</Text>
        <View style={styles.categoriesGrid}>
          {(data?.categories ?? []).map((item) => (
            <CategoryGridCard key={item._id} category={item} onPress={() => router.push(`/category/${item.slug}`)} />
          ))}
        </View>
      </View>

      <View style={styles.sectionPad}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {attempts.length === 0 ? (
          <Text style={styles.muted}>Nothing here yet - your finished exams will show up in this list.</Text>
        ) : (
          attempts.map((a) => <ActivityRow key={a._id} attempt={a} />)
        )}
      </View>
    </ScrollView>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityRow({ attempt }: { attempt: RecentAttemptSummary }) {
  const pct = attempt.totalQuestions > 0 ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0;
  const tone = pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'danger';
  const toneColors = {
    success: { bg: colors.successBg, text: colors.success },
    warning: { bg: colors.accentSoft, text: colors.warning },
    danger: { bg: colors.dangerBg, text: colors.danger },
  }[tone];

  return (
    <View style={styles.activityRow}>
      <View style={styles.activityLeft}>
        <Text style={styles.activityType}>{attempt.examType === 'mock' ? 'Mock Test' : 'Practice'}</Text>
        <Text style={styles.activityDate}>{formatRelativeDate(attempt.submittedAt)}</Text>
      </View>
      <View style={[styles.scorePill, { backgroundColor: toneColors.bg }]}>
        <Text style={[styles.scorePillText, { color: toneColors.text }]}>
          {attempt.score}/{attempt.totalQuestions} · {pct}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  greetingSmall: { color: '#dbeafe', fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  greetingBig: { color: '#ffffff', fontSize: 20, fontWeight: '700', lineHeight: 26 },

  heroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroLabel: { ...typography.caption, fontWeight: '700', color: colors.primary, letterSpacing: 0.5, marginBottom: spacing.xs },
  heroTitle: { ...typography.subtitle, marginBottom: spacing.md },
  heroProgressRow: { marginBottom: spacing.xs },
  heroMeta: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },

  sectionPad: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.subtitle, marginTop: spacing.xl, marginBottom: spacing.sm },
  muted: { color: colors.textMuted, fontSize: 13 },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  statValue: { ...typography.subtitle, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },

  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  activityLeft: { gap: 2 },
  activityType: { ...typography.body, fontWeight: '600', color: colors.text },
  activityDate: { ...typography.caption, color: colors.textMuted },
  scorePill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  scorePillText: { fontSize: 12, fontWeight: '700' },
});