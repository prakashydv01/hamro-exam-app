import { Ionicons } from '@expo/vector-icons';

// Best-effort icon per category, matched loosely by name so new categories
// (added later via the admin dashboard) still get a sensible icon without
// code changes - falls through to a generic "library" icon otherwise.
export function iconForCategory(name: string): keyof typeof Ionicons.glyphMap {
  const n = name.toLowerCase();
  if (n.includes('engineer')) return 'construct-outline';
  if (n.includes('loksewa')) return 'briefcase-outline';
  if (n.includes('medic') || n.includes('cmat')) return 'medkit-outline';
  if (n.includes('bank')) return 'cash-outline';
  if (n.includes('see') || n.includes('+2')) return 'school-outline';
  return 'library-outline';
}