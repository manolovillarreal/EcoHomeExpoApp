import { FlatList, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme/designSystem';
import MessageBubble from './MessageBubble';

export default function MessageList({
  messages,
  currentUserId,
  currentUserName,
  privateParticipantName,
  roomType,
  emptyText,
}) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item, index) =>
        String(item?.id || item?.created_at || item?.timestamp || `${item?.user_id}-${index}`)
      }
      contentContainerStyle={styles.content}
      style={styles.list}
      renderItem={({ item, index }) => {
        const previous = index > 0 ? messages[index - 1] : null;
        const isOwnMessage = String(item?.user_id) === String(currentUserId);
        const isGrouped =
          previous && String(previous?.user_id) === String(item?.user_id);
        const fallbackAuthorName =
          roomType === 'private'
            ? isOwnMessage
              ? currentUserName
              : privateParticipantName
            : undefined;

        return (
          <MessageBubble
            message={item}
            isOwnMessage={isOwnMessage}
            isGrouped={Boolean(isGrouped)}
            authorName={fallbackAuthorName}
          />
        );
      }}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{emptyText}</Text>
          <Text style={styles.emptySubtitle}>Escribe el primer mensaje para iniciar la conversacion.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing[5],
    gap: spacing[1],
  },
  emptyTitle: {
    ...typography.cardTitle,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
});
