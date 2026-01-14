import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Input } from '../design-system';

interface QuantityInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = '1',
  error = false,
  errorText,
  disabled = false,
  style,
}) => {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');

    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }

    if (parts[1] && parts[1].length > 3) {
      return;
    }

    onChangeText(cleaned);
  };

  const formatDisplay = (text: string) => {
    if (!text) return '';
    return text;
  };

  return (
    <Input
      label={label}
      value={formatDisplay(value)}
      onChangeText={handleChange}
      placeholder={placeholder}
      keyboardType="decimal-pad"
      error={error}
      errorText={errorText}
      disabled={disabled}
      leftIcon="counter"
      style={style}
    />
  );
};

const styles = StyleSheet.create({});
