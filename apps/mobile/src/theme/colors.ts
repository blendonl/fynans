export const lightColors = {
  // Primary colors
  primary: '#6200EE',
  primaryVariant: '#3700B3',
  primaryLight: '#9D46FF',
  secondary: '#03DAC6',
  secondaryVariant: '#018786',

  // Backgrounds
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  surfaceElevated: '#FFFFFF',

  // Semantic colors
  error: '#DC3545',
  success: '#4CAF50',
  warning: '#FB8C00',
  info: '#2196F3',

  // Text colors
  text: '#000000DE',
  textSecondary: '#00000099',
  textDisabled: '#00000061',

  // Borders & dividers
  divider: '#0000001F',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  placeholder: '#00000061',
  backdrop: '#00000080',

  // Transaction-specific accent colors
  income: '#10B981',
  incomeLight: '#34D399',
  incomeDark: '#059669',
  expense: '#EF4444',
  expenseLight: '#F87171',
  expenseDark: '#DC2626',

  // Glassmorphism colors
  glassBackground: 'rgba(255, 255, 255, 0.15)',
  glassBackgroundStrong: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassShadow: 'rgba(0, 0, 0, 0.1)',
  glassOverlay: 'rgba(98, 0, 238, 0.08)',

  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  gradientPrimaryStart: '#6200EE',
  gradientPrimaryEnd: '#9D46FF',
  gradientIncomeStart: '#10B981',
  gradientIncomeEnd: '#34D399',
  gradientExpenseStart: '#EF4444',
  gradientExpenseEnd: '#F87171',

  // Dropdown & selection
  dropdownBackground: '#FFFFFF',
  dropdownHover: '#F8F9FA',
  selectionBackground: 'rgba(98, 0, 238, 0.08)',
  selectionBorder: '#6200EE',

  // Family-specific colors
  familyPersonal: '#6366F1',
  familyPersonalLight: 'rgba(99, 102, 241, 0.1)',
  familyGroup: '#14B8A6',
  familyGroupLight: 'rgba(20, 184, 166, 0.1)',

  // Role colors
  roleOwner: '#FF6B35',
  roleOwnerBackground: 'rgba(255, 107, 53, 0.1)',
  roleAdmin: '#2196F3',
  roleAdminBackground: 'rgba(33, 150, 243, 0.1)',
  roleMember: '#757575',
  roleMemberBackground: 'rgba(117, 117, 117, 0.1)',

  // Interactive states
  hoverOverlay: 'rgba(0, 0, 0, 0.04)',
  pressedOverlay: 'rgba(0, 0, 0, 0.08)',
  focusOutline: '#6200EE',
};

export const darkColors = {
  // Primary colors
  primary: '#BB86FC',
  primaryVariant: '#3700B3',
  primaryLight: '#E1BEE7',
  secondary: '#03DAC6',
  secondaryVariant: '#03DAC6',

  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  surfaceElevated: '#252525',

  // Semantic colors
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#FFFFFFB3',
  textDisabled: '#FFFFFF61',

  // Borders & dividers
  divider: '#FFFFFF1F',
  border: '#424242',
  borderLight: '#333333',
  placeholder: '#FFFFFF61',
  backdrop: '#000000CC',

  // Transaction-specific accent colors
  income: '#10B981',
  incomeLight: '#34D399',
  incomeDark: '#059669',
  expense: '#EF4444',
  expenseLight: '#F87171',
  expenseDark: '#DC2626',

  // Glassmorphism colors
  glassBackground: 'rgba(30, 30, 30, 0.25)',
  glassBackgroundStrong: 'rgba(30, 30, 30, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassShadow: 'rgba(0, 0, 0, 0.3)',
  glassOverlay: 'rgba(187, 134, 252, 0.08)',

  // Gradients
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  gradientPrimaryStart: '#BB86FC',
  gradientPrimaryEnd: '#E1BEE7',
  gradientIncomeStart: '#10B981',
  gradientIncomeEnd: '#34D399',
  gradientExpenseStart: '#EF4444',
  gradientExpenseEnd: '#F87171',

  // Dropdown & selection
  dropdownBackground: '#252525',
  dropdownHover: '#2C2C2C',
  selectionBackground: 'rgba(187, 134, 252, 0.12)',
  selectionBorder: '#BB86FC',

  // Family-specific colors
  familyPersonal: '#818CF8',
  familyPersonalLight: 'rgba(129, 140, 248, 0.15)',
  familyGroup: '#2DD4BF',
  familyGroupLight: 'rgba(45, 212, 191, 0.15)',

  // Role colors
  roleOwner: '#FF8A65',
  roleOwnerBackground: 'rgba(255, 138, 101, 0.15)',
  roleAdmin: '#64B5F6',
  roleAdminBackground: 'rgba(100, 181, 246, 0.15)',
  roleMember: '#9E9E9E',
  roleMemberBackground: 'rgba(158, 158, 158, 0.15)',

  // Interactive states
  hoverOverlay: 'rgba(255, 255, 255, 0.04)',
  pressedOverlay: 'rgba(255, 255, 255, 0.08)',
  focusOutline: '#BB86FC',
};

export type ColorPalette = typeof lightColors;
