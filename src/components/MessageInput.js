import { StyleSheet, TextInput, View } from 'react-native';

import AppButton from './AppButton';
import { colors, spacing } from '../theme/designSystem';

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  placeholder,
  disabled,
}) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSoft}
        style={styles.input}
        multiline
        editable={!disabled}
      />
      <AppButton
        label="Enviar"
        onPress={onSend}
        disabled={disabled || !value.trim()}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[1],
    padding: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  button: {
    minWidth: 104,
  },
});
