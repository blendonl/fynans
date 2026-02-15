"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  LogOut,
  Trash2,
  Clock,
  X,
  Crown,
  Shield,
  User,
} from "lucide-react";
import {
  useFamilyDetail,
  useFamilies,
  useFamilySentInvitations,
} from "@/hooks/use-families";
import { formatCurrency } from "@fynans/shared";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const MEMBER_COLORS = [
  "#B8860B",
  "#5B8A8A",
  "#3B7DD9",
  "#2D9D5E",
  "#8B6B4A",
  "#7B5EA7",
  "#D9910A",
  "#C55454",
];

function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

function getMemberInitials(
  firstName: string | null,
  lastName: string | null,
) {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return (first + last).toUpperCase() || "?";
}

const ROLE_CONFIG = {
  OWNER: { label: "Owner", icon: Crown, color: "var(--role-owner)", bg: "var(--role-owner)" },
  ADMIN: { label: "Admin", icon: Shield, color: "var(--role-admin)", bg: "var(--role-admin)" },
  MEMBER: { label: "Member", icon: User, color: "var(--role-member)", bg: "var(--role-member)" },
} as const;

export default function FamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: family, isLoading } = useFamilyDetail(id);
  const { inviteMember, removeMember, leaveFamily } = useFamilies();
  const { sentInvitations, cancelInvitation } = useFamilySentInvitations(id);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4 dash-animate-in">
        <div className="h-10 w-24 rounded-xl skeleton-shimmer" />
        <div className="h-[140px] rounded-2xl skeleton-shimmer" />
        <div className="h-[200px] rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-text-secondary mb-4">Family not found</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="dash-animate-in">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Hero */}
      <div className="dash-animate-in dash-delay-1 relative overflow-hidden rounded-2xl border border-border-light bg-surface p-6">
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />

        <PageHeader label="Family" title={family.name} />
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-text amount-animate">
            {formatCurrency(family.balance)}
          </span>
          <span className="text-xs text-text-secondary">balance</span>
        </div>
      </div>

      {/* Members */}
      <div className="dash-animate-in dash-delay-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-text">
            Members
            <span className="ml-1.5 text-text-secondary font-normal">
              ({family.members.length})
            </span>
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInvite(true)}
            className="gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface divide-y divide-divider overflow-hidden">
          {family.members.map((member) => {
            const initials = getMemberInitials(
              member.user.firstName,
              member.user.lastName,
            );
            const color = getColorForName(member.user.email);
            const role =
              ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG];
            const RoleIcon = role?.icon || User;
            const isCurrentUser = member.userId === user?.id;

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3.5 group"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                  style={{ background: color }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {member.user.firstName} {member.user.lastName}
                    {isCurrentUser && (
                      <span className="text-text-secondary font-normal ml-1">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {member.user.email}
                  </p>
                </div>

                <div
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                  style={{
                    color: role?.color,
                    background: `color-mix(in srgb, ${role?.bg} 10%, transparent)`,
                  }}
                >
                  <RoleIcon className="h-3 w-3" />
                  {role?.label}
                </div>

                {!isCurrentUser && (
                  <button
                    onClick={() =>
                      removeMember.mutate({
                        familyId: id,
                        userId: member.userId,
                      })
                    }
                    className="h-8 w-8 rounded-full flex items-center justify-center text-text-disabled hover:text-error hover:bg-[var(--error)]/10 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {sentInvitations.length > 0 && (
        <div className="dash-animate-in dash-delay-3 space-y-3">
          <h2 className="text-sm font-semibold text-text px-1">
            Pending invitations
            <span className="ml-1.5 text-text-secondary font-normal">
              ({sentInvitations.length})
            </span>
          </h2>

          <div className="rounded-2xl border border-border-light bg-surface divide-y divide-divider overflow-hidden">
            {sentInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between px-4 py-3.5 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">
                    {invitation.inviteeEmail}
                  </p>
                  <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    Expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => cancelInvitation.mutate(invitation.id)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-text-disabled hover:text-error hover:bg-[var(--error)]/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Family */}
      <div className="dash-animate-in dash-delay-4 pt-4">
        <button
          onClick={() => {
            leaveFamily.mutate(id);
            router.push("/families");
          }}
          className="flex items-center gap-2 text-sm font-medium text-text-disabled hover:text-error transition-colors cursor-pointer px-1"
        >
          <LogOut className="h-4 w-4" />
          Leave this family
        </button>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inviteEmail.trim()) {
                  inviteMember
                    .mutateAsync({ familyId: id, email: inviteEmail })
                    .then(() => {
                      setInviteEmail("");
                      setShowInvite(false);
                    });
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await inviteMember.mutateAsync({
                  familyId: id,
                  email: inviteEmail,
                });
                setInviteEmail("");
                setShowInvite(false);
              }}
              loading={inviteMember.isPending}
              disabled={!inviteEmail.trim()}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
