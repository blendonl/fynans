export const MANAGE_TABS = {
  items: "items",
  stores: "stores",
  categories: "categories",
} as const;

export type ManageTab = (typeof MANAGE_TABS)[keyof typeof MANAGE_TABS];

const DEFAULT_MANAGE_TAB: ManageTab = MANAGE_TABS.items;

export function resolveManageTab(value: string | null | undefined): ManageTab {
  const candidates = Object.values(MANAGE_TABS) as ManageTab[];
  return candidates.find((tab) => tab === value) ?? DEFAULT_MANAGE_TAB;
}

export function manageTabHref(tab: ManageTab): string {
  return `/manage?tab=${tab}`;
}
