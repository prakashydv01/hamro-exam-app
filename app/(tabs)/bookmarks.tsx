import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/constants/theme';
import type { Bookmark } from '@/types/api';

export default function BookmarksScreen() {
  const { data, isLoading, removeBookmark } = useBookmarks();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookmarks</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.muted}>No bookmarked questions yet.</Text>}
        renderItem={({ item }) => (
          <BookmarkItem
            bookmark={item}
            expanded={expandedId === item._id}
            onToggle={() => setExpandedId(expandedId === item._id ? null : item._id)}
            onRemove={() => removeBookmark(item.questionId._id)}
          />
        )}
      />
    </View>
  );
}

function BookmarkItem({
  bookmark,
  expanded,
  onToggle,
  onRemove,
}: {
  bookmark: Bookmark;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const q = bookmark.questionId;

  return (
    <Card style={styles.card}>
      <Pressable onPress={onToggle} style={styles.headerRow}>
        <Text style={styles.question} numberOfLines={expanded ? undefined : 2}>{q.question}</Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </Pressable>

      {expanded && (
        <View style={styles.expanded}>
          {q.options.map((opt) => (
            <Text
              key={opt.id}
              style={[styles.option, opt.id === q.correctOptionId && styles.correctOption]}
            >
              {opt.id === q.correctOptionId ? '✓ ' : '• '}
              {opt.text}
            </Text>
          ))}
          {q.explanation ? <Text style={styles.explanation}>{q.explanation}</Text> : null}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.title, marginBottom: spacing.lg },
  list: { paddingBottom: spacing.xxl },
  muted: { color: colors.textMuted, fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  card: { marginBottom: spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  question: { flex: 1, fontSize: 14, color: colors.text },
  expanded: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  option: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  correctOption: { color: colors.success, fontWeight: '600' },
  explanation: { fontSize: 13, color: colors.text, marginTop: spacing.sm, fontStyle: 'italic' },
});
