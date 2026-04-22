import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/designSystem';

export default function ChatHeader({
  title,
  subtitle,
  status,
  participantCount,
  onMenuPress,
  showMenuButton,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showMenuButton ? (
          <Pressable style={styles.menuButton} onPress={onMenuPress}>
            <Text style={styles.menuButtonText}>☰</Text>
          </Pressable>
        ) : null}

        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {subtitle} · {participantCount} participante{participantCount === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, status === 'Conectado' ? styles.statusDotOnline : styles.statusDotOffline]} />
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  statusDotOnline: {
    backgroundColor: colors.success,
  },
  statusDotOffline: {
    backgroundColor: colors.textSoft,
  },
  statusText: {
    ...typography.meta,
    color: colors.textMuted,
  },
});
