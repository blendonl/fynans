const categoryIconMap: Record<string, string> = {
  groceries: '🛒',
  food: '🍔',
  restaurant: '🍽️',
  dining: '🍽️',
  transport: '🚗',
  transportation: '🚗',
  gas: '⛽',
  fuel: '⛽',
  shopping: '🛍️',
  clothing: '👕',
  entertainment: '🎬',
  movies: '🎬',
  health: '💊',
  medical: '🏥',
  pharmacy: '💊',
  utilities: '💡',
  bills: '📄',
  rent: '🏠',
  housing: '🏠',
  mortgage: '🏠',
  insurance: '🛡️',
  education: '📚',
  travel: '✈️',
  vacation: '🏖️',
  fitness: '🏋️',
  gym: '🏋️',
  sports: '⚽',
  pets: '🐾',
  gifts: '🎁',
  subscriptions: '📱',
  technology: '💻',
  electronics: '📱',
  personal: '👤',
  beauty: '💄',
  salary: '💰',
  income: '💵',
  bonus: '🎉',
  investment: '📈',
  freelance: '💼',
  refund: '↩️',
  other: '📋',
};

export const getCategoryIcon = (categoryName: string): string => {
  const normalizedName = categoryName.toLowerCase().trim();

  if (categoryIconMap[normalizedName]) {
    return categoryIconMap[normalizedName];
  }

  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon;
    }
  }

  return '📋';
};
