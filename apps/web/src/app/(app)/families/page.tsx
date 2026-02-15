"use client";

import Link from "next/link";
import { Plus, Users, ChevronRight, Mail, Check, X } from "lucide-react";
import { useFamilies } from "@/hooks/use-families";
import { formatCurrency } from "@fynans/shared";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const FAMILY_COLORS = [
  "#B8860B", "#5B8A8A", "#3B7DD9", "#2D9D5E", "#8B6B4A", "#7B5EA7",
];

function getColorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FAMILY_COLORS[Math.abs(hash) % FAMILY_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FamiliesPage() {
  const {
    families,
    pendingInvitations,
    isLoading,
    acceptInvitation,
    declineInvitation,
  } = useFamilies();

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        label="Shared finances"
        title="Families"
        description="Manage your shared family finances and members."
        className="dash-animate-in"
      >
        <Link href="/families/create">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Family</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="dash-animate-in dash-delay-1">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--primary)]/15 bg-gradient-to-br from-[var(--primary-muted)] to-transparent p-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-40 gradient-line-shimmer" />

            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Mail className="h-[18px] w-[18px] text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">
                  {pendingInvitations.length} pending invitation
                  {pendingInvitations.length !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-text-secondary">
                  Accept to join a family
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl bg-surface/70 backdrop-blur-sm border border-border-light/50 px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text truncate">
                      Family invitation
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {inv.inviteeEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    <button
                      onClick={() => acceptInvitation.mutate(inv.id)}
                      className="h-8 w-8 rounded-full bg-[var(--success)]/10 hover:bg-[var(--success)]/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    </button>
                    <button
                      onClick={() => declineInvitation.mutate(inv.id)}
                      className="h-8 w-8 rounded-full bg-[var(--error)]/10 hover:bg-[var(--error)]/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5 text-[var(--error)]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Family List */}
      {isLoading ? (
        <div className="space-y-3 dash-animate-in dash-delay-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[84px] rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : families.length === 0 ? (
        <div className="dash-animate-in dash-delay-2 flex flex-col items-center justify-center py-16 px-6">
          <div className="relative mb-6">
            <div
              className="absolute -inset-4 rounded-full opacity-15 blur-2xl"
              style={{ background: "var(--primary)" }}
            />
            <div className="relative h-20 w-20 rounded-2xl bg-surface-variant flex items-center justify-center border border-border-light">
              <Users className="h-9 w-9 text-text-disabled" />
            </div>
          </div>
          <p className="text-base font-semibold text-text mb-1">
            No families yet
          </p>
          <p className="text-sm text-text-secondary text-center max-w-[280px] mb-6 leading-relaxed">
            Create a family to start tracking shared expenses with your loved
            ones
          </p>
          <Link href="/families/create">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Create your first family
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {families.map((family, index) => {
            const color = getColorForName(family.name);
            const initials = getInitials(family.name);
            const delay = Math.min(index + 2, 8);
            return (
              <Link
                key={family.id}
                href={`/families/${family.id}`}
                className={`block dash-animate-in dash-delay-${delay}`}
              >
                <div className="group relative flex items-center gap-4 rounded-2xl border border-border-light bg-surface p-4 hover:border-border hover:shadow-[0_2px_12px_var(--glass-shadow)] transition-all duration-200 cursor-pointer active:scale-[0.985]">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white text-[13px] font-bold tracking-wider shadow-sm"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-text truncate leading-tight">
                      {family.name}
                    </p>
                    <p className="text-sm text-text-secondary mt-1 font-mono">
                      {formatCurrency(family.balance)}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-text-disabled group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
