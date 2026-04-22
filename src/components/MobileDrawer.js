import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/designSystem';

export default function MobileDrawer({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 35, 27, 0.32)',
  },
  panel: {
    width: 320,
    maxWidth: '86%',
    backgroundColor: colors.background,
    padding: 16,
  },
});
