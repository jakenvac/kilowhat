import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

type SelectionModalProps<T> = {
  readonly visible: boolean;
  readonly title: string;
  readonly items: readonly T[];
  readonly selectedIndex: number;
  readonly getItemKey: (item: T) => string;
  readonly getItemLabel: (item: T) => string;
  readonly addButtonLabel: string;
  readonly onClose: () => void;
  readonly onSelect: (index: number) => void;
  readonly onEdit: (item: T) => void;
  readonly onDelete: (item: T) => void;
  readonly onAdd: () => void;
};

export function SelectionModal<T>({
  visible,
  title,
  items,
  selectedIndex,
  getItemKey,
  getItemLabel,
  addButtonLabel,
  onClose,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: SelectionModalProps<T>) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialDesignIcons name="close" size={24} color="#aaa" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalList}>
            {items.map((item, i) => (
              <View key={getItemKey(item)} style={styles.itemRow}>
                <Pressable
                  style={styles.itemRowPressable}
                  onPress={() => onSelect(i)}
                >
                  <View style={styles.itemRowLeft}>
                    {i === selectedIndex && (
                      <MaterialDesignIcons name="check" size={20} color="#00c896" />
                    )}
                    <Text style={[
                      styles.itemRowText,
                      i === selectedIndex && styles.itemRowTextSelected
                    ]}>
                      {getItemLabel(item)}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.itemRowActions}>
                  <Pressable
                    onPress={() => onEdit(item)}
                    hitSlop={8}
                    style={styles.iconButton}
                  >
                    <MaterialDesignIcons name="pencil" size={20} color="#aaa" />
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(item)}
                    hitSlop={8}
                    style={styles.iconButton}
                  >
                    <MaterialDesignIcons name="trash-can-outline" size={20} color="#ff6b6b" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={styles.addButton}
            onPress={onAdd}
          >
            <MaterialDesignIcons name="plus" size={20} color="#000" />
            <Text style={styles.addButtonText}>{addButtonLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 400,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
  itemRowPressable: {
    flex: 1,
    paddingVertical: 12,
  },
  itemRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  itemRowTextSelected: {
    fontWeight: '600',
    color: '#00c896',
  },
  itemRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00c896',
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
