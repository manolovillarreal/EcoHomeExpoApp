import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/designSystem';

function getAuthor(message, fallbackAuthorName) {
  return (
    fallbackAuthorName ||
    message?.user_name_snapshot ||
    message?.user_name ||
    message?.username ||
    `User ${message?.user_id || ''}`.trim()
  );
}

function getMessageText(message) {
  return message?.text || message?.message || message?.content || '';
}

function formatTimestamp(message) {
  const raw = message?.created_at || message?.timestamp || message?.createdAt;

  if (!raw) {
    return '';
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function MessageBubble({ message, isOwnMessage, isGrouped, authorName }) {
  const author = getAuthor(message, authorName);
  const timestamp = formatTimestamp(message);

  return (
    <View style={[styles.wrapper, isOwnMessage ? styles.wrapperOwn : styles.wrapperOther, isGrouped && styles.wrapperGrouped]}>
      {!isGrouped ? (
        <View style={[styles.metaRow, isOwnMessage && styles.metaRowOwn]}>
          <Text style={[styles.author, isOwnMessage && styles.authorOwn]}>{author}</Text>
          {timestamp ? <Text style={[styles.timestamp, isOwnMessage && styles.timestampOwn]}>{timestamp}</Text> : null}
        </View>
      ) : null}

      <View style={[styles.bubble, isOwnMessage ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwnMessage && styles.textOwn]}>{getMessageText(message)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[2],
    maxWidth: '84%',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
  },
  wrapperGrouped: {
    marginTop: -8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  metaRowOwn: {
    justifyContent: 'flex-end',
  },
  author: {
    ...typography.meta,
    color: colors.textMuted,
  },
  authorOwn: {
    color: colors.primary,
  },
  timestamp: {
    ...typography.meta,
    color: colors.textSoft,
  },
  timestampOwn: {
    color: colors.textSoft,
  },
  bubble: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
  textOwn: {
    color: '#ffffff',
  },
});
