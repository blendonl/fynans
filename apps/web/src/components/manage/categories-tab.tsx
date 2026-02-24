"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExpenseCategoriesTab } from "./expense-categories-tab";
import { ItemCategoriesTab } from "./item-categories-tab";
import { IncomeCategoriesTab } from "./income-categories-tab";

export function CategoriesTab() {
  return (
    <Tabs defaultValue="expense">
      <TabsList>
        <TabsTrigger value="expense">Expense</TabsTrigger>
        <TabsTrigger value="item">Item</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
      </TabsList>
      <TabsContent value="expense">
        <ExpenseCategoriesTab />
      </TabsContent>
      <TabsContent value="item">
        <ItemCategoriesTab />
      </TabsContent>
      <TabsContent value="income">
        <IncomeCategoriesTab />
      </TabsContent>
    </Tabs>
  );
}
