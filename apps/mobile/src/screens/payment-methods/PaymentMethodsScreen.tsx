import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, Card } from '../../components/design-system';
import { PriceInput } from '../../components/forms';
import { useAppTheme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import {
  paymentMethodControllerCreate,
  paymentMethodControllerUpdate,
  paymentMethodControllerRemove,
} from '../../api/generated/endpoints/payment-method/payment-method';
import { formatCurrency } from '../../utils/currency';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import type { PaymentMethodResponseDto } from '../../api/generated/model';

type PaymentMethod = PaymentMethodResponseDto;

const PRESET_COLORS = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#00BCD4',
];

export default function PaymentMethodsScreen() {
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const { paymentMethods, loading, refresh } = usePaymentMethods();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const totalBalance = paymentMethods.reduce(
    (sum, pm) => sum + pm.currentBalance,
    0,
  );

  const openCreateModal = () => {
    setEditingMethod(null);
    setName('');
    setInitialBalance('');
    setSelectedColor(PRESET_COLORS[0]);
    setModalVisible(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setName(method.name);
    setInitialBalance(method.initialBalance.toString());
    setSelectedColor(method.color);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMethod(null);
    setName('');
    setInitialBalance('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!initialBalance || parseFloat(initialBalance) < 0) {
      Alert.alert('Error', 'Please enter a valid initial balance');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        initialBalance: parseFloat(initialBalance),
        color: selectedColor,
      };

      if (editingMethod) {
        await paymentMethodControllerUpdate(editingMethod.id, payload);
        showToast({
          type: 'SUCCESS',
          title: 'Updated',
          message: `${name} has been updated`,
        });
      } else {
        await paymentMethodControllerCreate(payload as any);
        showToast({
          type: 'SUCCESS',
          title: 'Created',
          message: `${name} has been added`,
        });
      }

      closeModal();
      refresh();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save payment method');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (method: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete "${method.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentMethodControllerRemove(method.id);
              showToast({
                type: 'SUCCESS',
                title: 'Deleted',
                message: `${method.name} has been removed`,
              });
              refresh();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete payment method',
              );
            }
          },
        },
      ],
    );
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <Card style={styles.methodCard} elevation={1}>
      <View style={styles.methodRow}>
        <View style={styles.methodInfo}>
          <View
            style={[styles.colorDot, { backgroundColor: item.color }]}
          />
          <View style={styles.methodText}>
            <Text
              style={[
                styles.methodName,
                theme.custom.typography.bodyMedium,
                { color: theme.custom.colors.text },
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                theme.custom.typography.caption,
                { color: theme.custom.colors.textSecondary },
              ]}
            >
              Initial: {formatCurrency(item.initialBalance)}
            </Text>
          </View>
        </View>
        <View style={styles.methodActions}>
          <Text
            style={[
              styles.balanceText,
              theme.custom.typography.bodyMedium,
              { color: theme.colors.primary },
            ]}
          >
            {formatCurrency(item.currentBalance)}
          </Text>
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={theme.custom.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.iconButton}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#F44336"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="credit-card-off-outline"
        size={64}
        color={theme.custom.colors.textSecondary}
      />
      <Text
        style={[
          styles.emptyTitle,
          theme.custom.typography.h5,
          { color: theme.custom.colors.text },
        ]}
      >
        No Payment Methods
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          theme.custom.typography.body,
          { color: theme.custom.colors.textSecondary },
        ]}
      >
        Add your first payment method to start tracking balances
      </Text>
      <Button
        title="Add Payment Method"
        onPress={openCreateModal}
        style={styles.emptyButton}
        icon="plus"
      />
    </View>
  );

  if (loading && paymentMethods.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <View style={styles.header}>
        <Text
          style={[
            theme.custom.typography.h4,
            { color: theme.custom.colors.text },
          ]}
        >
          Payment Methods
        </Text>
        <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <Card style={styles.totalCard} elevation={2}>
        <View style={styles.totalContent}>
          <Text
            style={[
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Total Balance
          </Text>
          <Text
            style={[
              styles.totalAmount,
              theme.custom.typography.h3,
              { color: theme.colors.primary },
            ]}
          >
            {formatCurrency(totalBalance)}
          </Text>
        </View>
      </Card>

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentMethod}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          paymentMethods.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
          edges={['top', 'bottom']}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                theme.custom.typography.h4,
                { color: theme.custom.colors.text },
              ]}
            >
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.custom.colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.formField}>
              <Input
                label="Name"
                placeholder="e.g. Cash, Visa, Bank Account"
                value={name}
                onChangeText={setName}
                leftIcon="credit-card"
              />
            </View>

            <View style={styles.formField}>
              <PriceInput
                label="Initial Balance"
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="0.00"
              />
            </View>

            <View style={styles.formField}>
              <Text
                style={[
                  styles.colorLabel,
                  theme.custom.typography.bodyMedium,
                  { color: theme.custom.colors.text },
                ]}
              >
                Color
              </Text>
              <View style={styles.colorRow}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                      selectedColor === color && {
                        borderColor: theme.custom.colors.text,
                      },
                    ]}
                  >
                    {selectedColor === color && (
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title={editingMethod ? 'Update' : 'Create'}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              fullWidth
              style={styles.saveButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    padding: 8,
  },
  totalCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  totalContent: {
    alignItems: 'center',
    padding: 20,
  },
  totalAmount: {
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  methodCard: {
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  methodText: {
    flex: 1,
  },
  methodName: {
    marginBottom: 2,
  },
  methodActions: {
    alignItems: 'flex-end',
  },
  balanceText: {
    marginBottom: 4,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 16,
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyButton: {
    marginTop: 24,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  modalBody: {
    padding: 16,
  },
  formField: {
    marginBottom: 20,
  },
  colorLabel: {
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderWidth: 3,
  },
  saveButton: {
    marginTop: 12,
  },
});
