import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, Chip, Dropdown } from '../design-system';
import { useAppTheme } from '../../theme';
import { useFamily } from '../../context/FamilyContext';
import { TransactionFilters } from '../../features/transactions/types';
import { getStartOfWeek, getStartOfMonth, getDaysAgo, getEndOfDay } from '../../utils/timeUtils';

type DatePreset = 'today' | 'week' | 'month' | 'last30' | 'custom' | null;

interface FilterSheetProps {
  visible: boolean;
  filters: TransactionFilters;
  categories: Array<{ id: string; name: string }>;
  onClose: () => void;
  onApply: (filters: TransactionFilters) => void;
  onClear: () => void;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  filters,
  categories,
  onClose,
  onApply,
  onClear,
}) => {
  const { theme } = useAppTheme();
  const { families } = useFamily();
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);
  const [datePreset, setDatePreset] = useState<DatePreset>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: TransactionFilters = {
      type: 'all',
      scope: 'all',
      familyId: null,
      categories: [],
      minAmount: '',
      maxAmount: '',
      dateFrom: null,
      dateTo: null,
    };
    setLocalFilters(clearedFilters);
    setDatePreset(null);
    onClear();
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const setType = (type: 'all' | 'expense' | 'income') => {
    setLocalFilters((prev) => ({ ...prev, type }));
  };

  const setScope = (scope: 'all' | 'personal' | 'family') => {
    setLocalFilters((prev) => ({
      ...prev,
      scope,
      familyId: scope !== 'family' ? null : prev.familyId,
    }));
  };

  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = getEndOfDay(new Date());

    switch (preset) {
      case 'today':
        setLocalFilters((prev) => ({ ...prev, dateFrom: today, dateTo: endOfToday }));
        break;
      case 'week':
        setLocalFilters((prev) => ({ ...prev, dateFrom: getStartOfWeek(), dateTo: endOfToday }));
        break;
      case 'month':
        setLocalFilters((prev) => ({ ...prev, dateFrom: getStartOfMonth(), dateTo: endOfToday }));
        break;
      case 'last30':
        setLocalFilters((prev) => ({ ...prev, dateFrom: getDaysAgo(30), dateTo: endOfToday }));
        break;
      case 'custom':
        break;
      case null:
        setLocalFilters((prev) => ({ ...prev, dateFrom: null, dateTo: null }));
        break;
    }
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return 'Select';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateFromChange = (_: any, selectedDate?: Date) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      selectedDate.setHours(0, 0, 0, 0);
      setLocalFilters((prev) => ({ ...prev, dateFrom: selectedDate }));
      setDatePreset('custom');
    }
  };

  const handleDateToChange = (_: any, selectedDate?: Date) => {
    setShowToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const endOfDay = getEndOfDay(selectedDate);
      setLocalFilters((prev) => ({ ...prev, dateTo: endOfDay }));
      setDatePreset('custom');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.custom.colors.border }]}>
          <Text
            style={[
              styles.title,
              theme.custom.typography.h3,
              { color: theme.custom.colors.text },
            ]}
          >
            Filter Transactions
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Date Range
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="Today"
                selected={datePreset === 'today'}
                onPress={() => applyDatePreset(datePreset === 'today' ? null : 'today')}
              />
              <Chip
                label="This Week"
                selected={datePreset === 'week'}
                onPress={() => applyDatePreset(datePreset === 'week' ? null : 'week')}
              />
              <Chip
                label="This Month"
                selected={datePreset === 'month'}
                onPress={() => applyDatePreset(datePreset === 'month' ? null : 'month')}
              />
              <Chip
                label="Last 30 Days"
                selected={datePreset === 'last30'}
                onPress={() => applyDatePreset(datePreset === 'last30' ? null : 'last30')}
              />
            </View>
            <View style={styles.datePickerRow}>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border },
                ]}
                onPress={() => setShowFromPicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={18}
                  color={theme.custom.colors.textSecondary}
                />
                <Text style={[styles.dateButtonText, { color: theme.custom.colors.text }]}>
                  {formatDateDisplay(localFilters.dateFrom)}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.dateSeparator, { color: theme.custom.colors.textSecondary }]}>to</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: theme.custom.colors.surface, borderColor: theme.custom.colors.border },
                ]}
                onPress={() => setShowToPicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={18}
                  color={theme.custom.colors.textSecondary}
                />
                <Text style={[styles.dateButtonText, { color: theme.custom.colors.text }]}>
                  {formatDateDisplay(localFilters.dateTo)}
                </Text>
              </TouchableOpacity>
            </View>
            {showFromPicker && (
              <DateTimePicker
                value={localFilters.dateFrom || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateFromChange}
                maximumDate={localFilters.dateTo || new Date()}
              />
            )}
            {showToPicker && (
              <DateTimePicker
                value={localFilters.dateTo || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateToChange}
                minimumDate={localFilters.dateFrom || undefined}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Transaction Type
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="All"
                selected={localFilters.type === 'all'}
                onPress={() => setType('all')}
              />
              <Chip
                label="Expenses"
                selected={localFilters.type === 'expense'}
                onPress={() => setType('expense')}
              />
              <Chip
                label="Incomes"
                selected={localFilters.type === 'income'}
                onPress={() => setType('income')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Transaction Scope
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="All"
                selected={localFilters.scope === 'all'}
                onPress={() => setScope('all')}
              />
              <Chip
                label="Personal"
                selected={localFilters.scope === 'personal'}
                onPress={() => setScope('personal')}
              />
              <Chip
                label="Family"
                selected={localFilters.scope === 'family'}
                onPress={() => setScope('family')}
              />
            </View>
          </View>

          {localFilters.scope === 'family' && families.length > 0 && (
            <View style={styles.section}>
              <Dropdown
                label="Select Family"
                value={localFilters.familyId}
                items={families.map((family) => ({
                  label: family.name,
                  value: family.id,
                }))}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, familyId: value }))
                }
                placeholder="Choose a family"
              />
            </View>
          )}

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Amount Range
            </Text>
            <View style={styles.row}>
              <Input
                label="Min Amount"
                value={localFilters.minAmount}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({ ...prev, minAmount: text }))
                }
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={styles.halfInput}
              />
              <View style={styles.spacer} />
              <Input
                label="Max Amount"
                value={localFilters.maxAmount}
                onChangeText={(text) =>
                  setLocalFilters((prev) => ({ ...prev, maxAmount: text }))
                }
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={styles.halfInput}
              />
            </View>
          </View>

          {categories.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  theme.custom.typography.h5,
                  { color: theme.custom.colors.text },
                ]}
              >
                Categories
              </Text>
              <View style={styles.chipRow}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    selected={localFilters.categories.includes(category.id)}
                    onPress={() => toggleCategory(category.id)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.custom.colors.border }]}>
          <Button
            title="Clear All"
            onPress={handleClear}
            variant="text"
            style={styles.footerButton}
          />
          <View style={styles.footerButtonGroup}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outlined"
              style={styles.footerButton}
            />
            <Button
              title="Apply"
              onPress={handleApply}
              variant="primary"
              style={styles.footerButton}
            />
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    marginTop: 'auto',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  dateSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  halfInput: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerButton: {
    marginHorizontal: 4,
  },
  footerButtonGroup: {
    flexDirection: 'row',
  },
});
