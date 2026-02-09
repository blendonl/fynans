import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Input, Button, ToggleSwitch } from "../../../components/design-system";
import { useAppTheme } from "../../../theme";
import { createGlassStyles } from "../../../theme/glassStyles";

interface AddCategoryModalProps {
  visible: boolean;
  categoryName: string;
  isConnectedToStore: boolean;
  loading: boolean;
  onCategoryName: (text: string) => void;
  onIsConnectedToStore: (value: boolean) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function AddCategoryModal({
  visible,
  categoryName,
  isConnectedToStore,
  loading,
  onCategoryName,
  onIsConnectedToStore,
  onCreate,
  onClose,
}: AddCategoryModalProps) {
  const { theme } = useAppTheme();
  const glassStyles = createGlassStyles(theme.custom.colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: theme.custom.colors.backdrop },
        ]}
      >
        <View
          style={[
            glassStyles.glassCardStrong,
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              theme.custom.typography.h4,
              { color: theme.custom.colors.text },
            ]}
          >
            Add New Category
          </Text>

          <Input
            placeholder="Category name"
            value={categoryName}
            onChangeText={onCategoryName}
            leftIcon="tag"
          />

          <View style={styles.toggleContainer}>
            <ToggleSwitch
              label="Requires store selection"
              value={isConnectedToStore}
              onValueChange={onIsConnectedToStore}
            />
            <Text
              style={[
                styles.helperText,
                theme.custom.typography.caption,
                { color: theme.custom.colors.textSecondary },
              ]}
            >
              Turn on for categories where you shop at specific stores (e.g., Groceries)
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outlined"
              style={styles.button}
            />

            <Button
              title="Create"
              onPress={onCreate}
              loading={loading}
              disabled={loading || !categoryName.trim()}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  toggleContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
