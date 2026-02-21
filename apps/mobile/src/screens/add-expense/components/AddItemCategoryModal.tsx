import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { ExpenseCategoryResponseDto } from "../../../api/generated/model";

type Category = ExpenseCategoryResponseDto;
import {
  Input,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
} from "../../../components/design-system";
import { useAppTheme } from "../../../theme";
import { createGlassStyles } from "../../../theme/glassStyles";

interface AddItemCategoryModalProps {
  visible: boolean;
  categoryName: string;
  selectedParent: Category | null;
  itemCategories: Category[];
  loading: boolean;
  onCategoryName: (text: string) => void;
  onParentSelect: (category: Category | null) => void;
  onCreate: () => void;
  onClose: () => void;
}

export function AddItemCategoryModal({
  visible,
  categoryName,
  selectedParent,
  itemCategories,
  loading,
  onCategoryName,
  onParentSelect,
  onCreate,
  onClose,
}: AddItemCategoryModalProps) {
  const { theme } = useAppTheme();
  const glassStyles = createGlassStyles(theme.custom.colors);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  const dropdownItems: DropdownItem[] = itemCategories.map((cat) => ({
    id: cat.id,
    label: cat.name,
  }));

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
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
            Create Item Category
          </Text>

          <Input
            placeholder="Category name"
            value={categoryName}
            onChangeText={onCategoryName}
            leftIcon="tag"
          />

          <Text
            style={[
              styles.label,
              theme.custom.typography.bodyMedium,
              { color: theme.custom.colors.text },
            ]}
          >
            Parent Category (optional)
          </Text>

          {selectedParent ? (
            <View style={styles.selectedContainer}>
              <Chip
                label={selectedParent.name}
                selected={true}
                onClose={() => onParentSelect(null)}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  {
                    backgroundColor: theme.custom.colors.surfaceVariant,
                    borderColor: theme.custom.colors.border,
                  },
                ]}
                onPress={() => setShowParentDropdown(!showParentDropdown)}
              >
                <Text
                  style={[
                    theme.custom.typography.body,
                    { color: theme.custom.colors.textSecondary },
                  ]}
                >
                  Select parent category
                </Text>
              </TouchableOpacity>

              <Dropdown
                items={dropdownItems}
                visible={showParentDropdown}
                onSelect={(item) => {
                  const category = itemCategories.find(
                    (cat) => cat.id === item.id
                  );
                  if (category) {
                    onParentSelect(category);
                    setShowParentDropdown(false);
                  }
                }}
                emptyMessage="No categories available"
              />
            </>
          )}

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outlined"
              disabled={loading}
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
  label: {
    marginTop: 12,
    marginBottom: 8,
  },
  selectedContainer: {
    marginBottom: 16,
  },
  selectButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
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
