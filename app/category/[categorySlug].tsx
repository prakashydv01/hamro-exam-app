import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFaculties } from '@/hooks/useFaculties';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { formatSlugTitle } from '@/utils/formatSlugTitle';

export default function CategoryFacultiesScreen() {
  const { categorySlug } = useLocalSearchParams<{ categorySlug: string }>();
  const { data, isLoading } = useFaculties(categorySlug);

  const categoryName = categorySlug ? formatSlugTitle(categorySlug) : '';
  const faculties = data ?? [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: true, title: categoryName || 'Faculties', headerBackTitle: 'Back' }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: categoryName || 'Faculties', headerBackTitle: 'Back' }} />

      <View style={styles.header}>
        <Text style={styles.subtitle}>Choose a program under {categoryName}</Text>
      </View>

      <View style={styles.content}>
        {faculties.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No faculties available in this category yet.</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {faculties.map((item, index) => (
              <FacultyRow
                key={item._id}
                name={item.name}
                onPress={() => router.push(`/faculty/${item.slug}`)}
                isLast={index === faculties.length - 1}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function FacultyRow({ name, onPress, isLast }: { name: string; onPress: () => void; isLast: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.iconCircle}>
        <Ionicons name="school-outline" size={20} color={colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{name}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      {!isLast && <View style={styles.divider} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted },

  content: { flex: 1, paddingHorizontal: spacing.lg },
  listCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowPressed: { backgroundColor: colors.background },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowLabel: { flex: 1, ...typography.subtitle },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg + 40 + spacing.md,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});