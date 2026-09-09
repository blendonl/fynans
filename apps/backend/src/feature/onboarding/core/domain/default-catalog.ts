export interface SeedCategoryNode {
  name: string;
  requiresStore?: boolean;
  children?: SeedCategoryNode[];
}

export const DEFAULT_EXPENSE_CATEGORIES: SeedCategoryNode[] = [
  { name: 'Groceries' },
  { name: 'Household Supplies' },
  { name: 'Restaurants & Cafes' },
  {
    name: 'Housing & Bills',
    children: [
      { name: 'Rent' },
      { name: 'Electricity' },
      { name: 'Water & Waste' },
      { name: 'Internet & Mobile' },
      { name: 'Heating & Firewood' },
    ],
  },
  {
    name: 'Transport',
    children: [
      { name: 'Fuel' },
      { name: 'Public Transport' },
      { name: 'Vehicle & Repairs' },
    ],
  },
  { name: 'Health & Pharmacy' },
  { name: 'Personal Care' },
  { name: 'Clothing & Shoes' },
  { name: 'Children & School' },
  { name: 'Home & Furniture' },
  { name: 'Entertainment' },
  { name: 'Gifts & Celebrations' },
  { name: 'Fees & Charges' },
  { name: 'Other' },
];

export const DEFAULT_INCOME_CATEGORIES: SeedCategoryNode[] = [
  { name: 'Salary' },
  { name: 'Freelance & Side Work' },
  { name: 'Remittances' },
  { name: 'Business Income' },
  { name: 'Rental Income' },
  { name: 'Pension & Benefits' },
  { name: 'Refunds & Reimbursements' },
  { name: 'Gifts Received' },
  { name: 'Other' },
];

export const DEFAULT_ITEM_CATEGORIES: string[] = [
  'Produce',
  'Bakery',
  'Dairy & Eggs',
  'Meat & Fish',
  'Grains & Pasta',
  'Pantry & Canned',
  'Snacks & Sweets',
  'Beverages',
  'Frozen',
  'Household',
  'Personal Care',
  'Baby & Kids',
  'Pet',
  'Other',
];

export function countSeedNodes(nodes: SeedCategoryNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + countSeedNodes(node.children ?? []),
    0,
  );
}
