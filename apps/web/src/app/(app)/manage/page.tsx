"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ItemsTab } from "@/components/manage/items-tab";
import { StoresTab } from "@/components/manage/stores-tab";
import { CategoriesTab } from "@/components/manage/categories-tab";

export default function ManagePage() {
  return (
    <div className="space-y-6 dash-animate-in">
      <PageHeader
        label="Settings"
        title="Manage"
        description="Browse, edit, and delete your items, stores, and categories."
      />

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <ItemsTab />
        </TabsContent>
        <TabsContent value="stores">
          <StoresTab />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
