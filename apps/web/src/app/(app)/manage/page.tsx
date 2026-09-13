"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ItemsTab } from "@/components/manage/items-tab";
import { StoresTab } from "@/components/manage/stores-tab";
import { CategoriesTab } from "@/components/manage/categories-tab";
import { MANAGE_TABS, resolveManageTab } from "@/lib/manage-tabs";

export default function ManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = resolveManageTab(searchParams.get("tab"));

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`/manage?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6 dash-animate-in">
      <PageHeader
        label="Settings"
        title="Manage"
        description="Browse, edit, and delete your items, stores, and categories."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value={MANAGE_TABS.items}>Items</TabsTrigger>
          <TabsTrigger value={MANAGE_TABS.stores}>Stores</TabsTrigger>
          <TabsTrigger value={MANAGE_TABS.categories}>Categories</TabsTrigger>
        </TabsList>
        <TabsContent value={MANAGE_TABS.items}>
          <ItemsTab />
        </TabsContent>
        <TabsContent value={MANAGE_TABS.stores}>
          <StoresTab />
        </TabsContent>
        <TabsContent value={MANAGE_TABS.categories}>
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
