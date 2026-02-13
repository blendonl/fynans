"use client";

import { useFamilies } from "@/hooks/use-families";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InvitationsPage() {
  const { pendingInvitations, acceptInvitation, declineInvitation } = useFamilies();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Invitations</h1>

      {pendingInvitations.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-text-secondary">No pending invitations</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingInvitations.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-text">Family invitation</p>
                  <p className="text-xs text-text-secondary">
                    Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
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
    </div>
  );
}
