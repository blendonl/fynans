"use client";

import Link from "next/link";
import { PlusCircle, ArrowLeftRight, BarChart3, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ACTIONS = [
  { href: "/add", label: "Add Transaction", icon: PlusCircle, color: "text-primary" },
  { href: "/transactions", label: "View All", icon: ArrowLeftRight, color: "text-info" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-success" },
  { href: "/profile", label: "Profile", icon: User, color: "text-warning" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {ACTIONS.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <action.icon className={`h-8 w-8 ${action.color}`} />
              <span className="text-sm font-medium text-text">{action.label}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
