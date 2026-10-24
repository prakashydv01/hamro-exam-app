import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { iconForCategory } from '@/utils/categoryIcon';
import type { Category } from '@/types/api';

interface CategoryListRowProps {
  category: Category;
  onPress: () => void;
  isLast?: boolean;
}

export function CategoryListRow({ category, onPress, isLast }: CategoryListRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconForCategory(category.name)} size={20} color={colors.primary} />
      </View>
      <Text style={styles.label}>{category.name}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      {!isLast && <View style={styles.divider} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.background },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: { flex: 1, ...typography.subtitle },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg + 40 + spacing.md, // aligns with the label, not under the icon
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
});