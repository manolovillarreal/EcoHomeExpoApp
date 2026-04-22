import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppButton from './AppButton';
import AppCard from './AppCard';
import { colors, radius, spacing, typography } from '../theme/designSystem';

function SidebarSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function getDisplayName(user) {
  
  return user?.name || user?.username || 'Unknown user';
}

function SidebarItem({ label, subtitle, active, onPress, accent = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.item,
        active && styles.itemActive,
        hovered && !active && styles.itemHovered,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={[styles.itemDot, accent && styles.itemDotAccent, active && styles.itemDotActive]} />
      <View style={styles.itemCopy}>
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={[styles.itemSubtitle, active && styles.itemSubtitleActive]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function ChatSidebar({
  currentUserName,
  currentUserStatus,
  conversations,
  onlineUsers,
  activeRoom,
  onSelectGlobal,
  onSelectUser,
  onLogout,
  style,
}) {
  return (
    <AppCard style={[styles.sidebar, style]}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>Workspace</Text>
        <Text style={styles.title}>EcoHome Chat</Text>
        <View style={styles.identity}>
          <View style={styles.statusDot} />
          <Text style={styles.identityText} numberOfLines={1}>
            {currentUserName} · {currentUserStatus}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SidebarSection title="Salas">
          <SidebarItem
            label="Chat global"
            subtitle="Todos los usuarios"
            active={activeRoom.type === 'global'}
            onPress={onSelectGlobal}
            accent
          />
        </SidebarSection>

        <SidebarSection title="Mensajes privados">
        {
          console.log("conversations",conversations)}
          {conversations.length ? (
            conversations.map((user) => (
              <SidebarItem
                key={String(user?.userId || user?.id)}
                label={getDisplayName(user)}
                subtitle={user?.isOnline ? 'En linea' : 'Desconectado'}
                active={
                  activeRoom.type === 'private' &&
                  String(activeRoom.userId) === String(user?.userId || user?.id)
                }
                onPress={() => onSelectUser(user?.userId || user?.id)}
                accent={Boolean(user?.isOnline)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No tienes conversaciones privadas todavia.</Text>
          )}
        </SidebarSection>

        <SidebarSection title="Usuarios en linea">
          {onlineUsers.length ? (
            onlineUsers.map((user) => (
              <View key={`online-${String(user?.userId || user?.id)}`} style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText} numberOfLines={1}>
                  {getDisplayName(user)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Solo estas tu conectado.</Text>
          )}
        </SidebarSection>
      </ScrollView>

      <AppButton label="Salir" variant="secondary" onPress={onLogout} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: '100%',
    padding: spacing[2],
    gap: spacing[2],
    backgroundColor: '#f7faf8',
  },
  top: {
    gap: spacing[1],
  },
  eyebrow: {
    ...typography.meta,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  identityText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  scrollContent: {
    gap: spacing[3],
    paddingBottom: spacing[2],
  },
  section: {
    gap: spacing[1],
  },
  sectionTitle: {
    ...typography.meta,
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  itemActive: {
    backgroundColor: colors.primary,
  },
  itemHovered: {
    backgroundColor: '#eef4f0',
  },
  itemPressed: {
    opacity: 0.92,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  itemDotAccent: {
    backgroundColor: colors.success,
  },
  itemDotActive: {
    backgroundColor: '#d7f4e7',
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    ...typography.caption,
    color: colors.text,
  },
  itemLabelActive: {
    color: '#ffffff',
  },
  itemSubtitle: {
    ...typography.meta,
    color: colors.textSoft,
  },
  itemSubtitleActive: {
    color: '#d7f4e7',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  onlineText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  emptyText: {
    ...typography.meta,
    color: colors.textSoft,
  },
});
