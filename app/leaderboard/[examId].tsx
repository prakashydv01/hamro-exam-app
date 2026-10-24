import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { colors, spacing, typography } from '@/constants/theme';

export default function LeaderboardScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { data, isLoading } = useLeaderboard(examId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Leaderboard', headerBackTitle: 'Back' }} />

      {data?.myRank ? (
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankText}>Your rank: #{data.myRank.rank} · Score: {data.myRank.score}</Text>
        </View>
      ) : null}

      <FlatList
        data={data?.top ?? []}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => <LeaderboardRow entry={item} isCurrentUser={item.userId === user?._id} />}
        ListEmptyComponent={<Text style={styles.muted}>No attempts recorded yet for this exam.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  myRankBanner: { padding: spacing.lg, backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: colors.border },
  myRankText: { ...typography.subtitle, color: colors.primaryDark },
  muted: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.xl },
});
