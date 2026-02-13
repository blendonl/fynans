"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, LogOut, Trash2, Clock, X } from "lucide-react";
import { useFamilyDetail, useFamilies, useFamilySentInvitations } from "@/hooks/use-families";
import { formatCurrency } from "@fynans/shared";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: family, isLoading } = useFamilyDetail(id);
  const { inviteMember, removeMember, leaveFamily } = useFamilies();
  const { sentInvitations, cancelInvitation } = useFamilySentInvitations(id);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  if (isLoading) {
    return <div className="h-64 rounded-xl bg-surface-variant animate-pulse" />;
  }

  if (!family) {
    return <div className="text-center py-12 text-text-secondary">Family not found</div>;
  }

  const roleColors: Record<string, string> = {
    OWNER: "text-[var(--role-owner)]",
    ADMIN: "text-[var(--role-admin)]",
    MEMBER: "text-[var(--role-member)]",
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{family.name}</CardTitle>
          <p className="text-sm text-text-secondary">Balance: {formatCurrency(family.balance)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text">Members ({family.members.length})</h3>
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Invite
            </Button>
          </div>

          <div className="space-y-2">
            {family.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-variant">
                <div>
                  <p className="text-sm font-medium text-text">
                    {member.user.firstName} {member.user.lastName}
                  </p>
                  <p className="text-xs text-text-secondary">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={roleColors[member.role]}>
                    {member.role}
                  </Badge>
                  {member.userId !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error"
                      onClick={() => removeMember.mutate({ familyId: id, userId: member.userId })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sentInvitations.length > 0 && (
            <>
              <h3 className="font-medium text-text">
                Pending Invitations ({sentInvitations.length})
              </h3>
              <div className="space-y-2">
                {sentInvitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-variant">
                    <div>
                      <p className="text-sm font-medium text-text">{invitation.inviteeEmail}</p>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error"
                      onClick={() => cancelInvitation.mutate(invitation.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          <Button
            variant="outline"
            className="w-full text-error"
            onClick={() => {
              leaveFamily.mutate(id);
              router.push("/families");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Leave Family
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                await inviteMember.mutateAsync({ familyId: id, email: inviteEmail });
                setInviteEmail("");
                setShowInvite(false);
              }}
              loading={inviteMember.isPending}
            >
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
