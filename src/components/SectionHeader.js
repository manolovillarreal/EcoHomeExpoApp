import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme/designSystem';

export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <View style={styles.row}>
      <View style={styles.content}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  content: {
    flex: 1,
    gap: 6,
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
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
});
