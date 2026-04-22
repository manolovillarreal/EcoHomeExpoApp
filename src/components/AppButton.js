import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/designSystem';

export default function AppButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  style,
  textStyle,
}) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        pressed && (isSecondary ? styles.secondaryPressed : styles.primaryPressed),
        hovered && isSecondary && styles.secondaryHovered,
        hovered && !isSecondary && styles.primaryHovered,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, isSecondary ? styles.secondaryText : styles.primaryText, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryHovered: {
    backgroundColor: colors.primaryPressed,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
    opacity: 0.96,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryHovered: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.58,
  },
  text: {
    ...typography.bodyStrong,
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: colors.text,
  },
});
