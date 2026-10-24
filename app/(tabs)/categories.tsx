import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategories } from '@/hooks/useCategories';
import { CategoryListRow } from '@/components/CategoryListRow';
import { colors, spacing, radius, typography } from '@/constants/theme';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useCategories();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const categories = data ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Choose where you want to focus</Text>
      </View>

      <View style={styles.content}>
        {categories.length === 0 ? (
          <Text style={styles.muted}>No categories available yet.</Text>
        ) : (
          <View style={styles.listCard}>
            {categories.map((item, index) => (
              <CategoryListRow
                key={item._id}
                category={item}
                onPress={() => router.push(`/category/${item.slug}`)}
                isLast={index === categories.length - 1}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  title: { ...typography.title, marginBottom: 2 },
  subtitle: { ...typography.body, color: colors.textMuted },

  content: { flex: 1, paddingHorizontal: spacing.lg },
  listCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  muted: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg },
});