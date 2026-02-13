"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useFamilies } from "@/hooks/use-families";
import { formatCurrency } from "@fynans/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FamiliesPage() {
  const { families, pendingInvitations, isLoading, acceptInvitation, declineInvitation } = useFamilies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Families</h1>
        <Link href="/families/create">
          <Button><Plus className="h-4 w-4 mr-2" /> Create Family</Button>
        </Link>
      </div>

      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text">Pending Invitations</h2>
          {pendingInvitations.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-text">Family invitation</p>
                  <p className="text-xs text-text-secondary">From: {inv.inviteeEmail}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptInvitation.mutate(inv.id)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => declineInvitation.mutate(inv.id)}>Decline</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-variant animate-pulse" />
          ))}
        </div>
      ) : families.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-text-disabled mb-4" />
          <p className="text-text-secondary">No families yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {families.map((family) => (
            <Link key={family.id} href={`/families/${family.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--family-group)]/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[var(--family-group)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{family.name}</p>
                      <p className="text-xs text-text-secondary">Balance: {formatCurrency(family.balance)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">View</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
