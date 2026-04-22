import { StyleSheet, Text, View } from 'react-native';

import AppCard from './AppCard';
import { colors, radius, spacing, typography } from '../theme/designSystem';

function getInitials(name) {
  return String(name || 'P')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function ProductListItem({ name, price, creator, style }) {
  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.creator}>Creado por {creator}</Text>
      </View>

      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>{price}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[2],
    gap: spacing[2],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    color: colors.primary,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  creator: {
    ...typography.meta,
    color: colors.textMuted,
  },
  priceBadge: {
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceText: {
    ...typography.caption,
    color: colors.success,
  },
});
