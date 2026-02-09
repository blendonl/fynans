"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilies } from "@/hooks/use-families";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateFamilyPage() {
  const router = useRouter();
  const { createFamily } = useFamilies();
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createFamily.mutateAsync(name.trim());
    router.push("/families");
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Family</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Family Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter family name"
              />
            </div>
            <Button type="submit" className="w-full" loading={createFamily.isPending}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
