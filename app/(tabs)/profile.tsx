import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, spacing, radius, typography } from '@/constants/theme';

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.headerLabel}>Profile</Text>
      </View>

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Badge
          label={user?.emailVerified ? 'Email verified' : 'Not verified'}
          tone={user?.emailVerified ? 'success' : 'danger'}
        />
      </View>

      <View style={styles.sectionPad}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '—'} />
          <View style={styles.divider} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phone ?? '—'} />
        </View>
      </View>

      <View style={styles.sectionPad}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="lock-closed-outline"
            label="Change password"
            value=""
            onPress={() => router.push('/change-password')}
          />
        </View>
      </View>

      <View style={styles.sectionPad}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="shield-checkmark-outline"
            label="Verification status"
            value={user?.emailVerified ? 'Verified' : 'Not verified'}
            valueColor={user?.emailVerified ? colors.success : colors.danger}
          />
          <View style={styles.divider} />
          <InfoRow icon="information-circle-outline" label="App version" value="1.0.0" />
        </View>
      </View>

      <View style={styles.sectionPad}>
        <Button title="Log out" onPress={handleLogout} variant="danger" fullWidth />
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoRight}>
        {!!value && (
          <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
            {value}
          </Text>
        )}
        {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.rowPressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerLabel: { color: '#ffffff', ...typography.title },

  identityCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xxl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { ...typography.title, color: colors.primary },
  name: { ...typography.subtitle, marginBottom: 2 },
  email: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },

  sectionPad: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.subtitle, marginTop: spacing.xl, marginBottom: spacing.sm },

  infoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowPressed: { opacity: 0.6 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  infoLabel: { ...typography.body, color: colors.text },
  infoValue: { ...typography.body, color: colors.textMuted, maxWidth: 160, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
});
