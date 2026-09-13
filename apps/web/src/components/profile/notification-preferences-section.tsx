"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  useNotificationPreferences,
  readTypePreferences,
} from "@/hooks/use-notification-preferences";
import type {
  NotificationChannel,
  TypePreferences,
} from "@/hooks/use-notification-preferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CHANNELS: { key: NotificationChannel; label: string }[] = [
  { key: "push", label: "Push" },
  { key: "inApp", label: "In-app" },
  { key: "toast", label: "Toast" },
];

const CHANNEL_SWITCHES: {
  key: "enablePushNotifications" | "enableInAppNotifications" | "enableToastNotifications";
  label: string;
  description: string;
}[] = [
  {
    key: "enablePushNotifications",
    label: "Push notifications",
    description: "Sent to your devices even when Fynans is closed.",
  },
  {
    key: "enableInAppNotifications",
    label: "In-app notifications",
    description: "Collected in your notifications list.",
  },
  {
    key: "enableToastNotifications",
    label: "Toasts",
    description: "Brief pop-ups while you are using the app.",
  },
];

const TYPE_GROUPS: { title: string; types: { key: string; label: string }[] }[] = [
  {
    title: "Family",
    types: [
      { key: "FAMILY_INVITATION_SENT", label: "Invitation sent" },
      { key: "FAMILY_INVITATION_RECEIVED", label: "Invitation received" },
      { key: "FAMILY_INVITATION_ACCEPTED", label: "Invitation accepted" },
      { key: "FAMILY_INVITATION_DECLINED", label: "Invitation declined" },
      { key: "FAMILY_MEMBER_JOINED", label: "Member joined" },
      { key: "FAMILY_MEMBER_LEFT", label: "Member left" },
      { key: "FAMILY_EXPENSE_CREATED", label: "Family expense added" },
      { key: "FAMILY_INCOME_CREATED", label: "Family income added" },
    ],
  },
  {
    title: "Transactions",
    types: [
      { key: "TRANSACTION_PENDING_CREATED", label: "Awaiting approval" },
      { key: "TRANSACTION_APPROVED", label: "Approved" },
      { key: "TRANSACTION_REJECTED", label: "Rejected" },
      { key: "TRANSACTION_MILESTONE_BUDGET_ALERT", label: "Budget alert" },
      { key: "TRANSACTION_MILESTONE_SPENDING_LIMIT", label: "Spending limit" },
    ],
  },
  {
    title: "Receipts & basket",
    types: [
      { key: "RECEIPT_PROCESSING_COMPLETE", label: "Receipt scanned" },
      { key: "BASKET_ITEM_ADDED", label: "Basket item added" },
      { key: "BASKET_ITEMS_BOUGHT", label: "Basket items bought" },
    ],
  },
];

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-surface-variant border border-border"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function toTimeInput(value?: string): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const hours = String(parsed.getUTCHours()).padStart(2, "0");
  const minutes = String(parsed.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function fromTimeInput(value: string): string | undefined {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;

  return new Date(Date.UTC(1970, 0, 1, hours, minutes)).toISOString();
}

export function NotificationPreferencesSection() {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const [showTypes, setShowTypes] = useState(false);

  const typePreferences: TypePreferences = readTypePreferences(
    preferences?.typePreferences
  );

  const isPending = updatePreferences.isPending;

  const setTypeChannel = (
    type: string,
    channel: NotificationChannel,
    enabled: boolean
  ) => {
    updatePreferences.mutate({
      typePreferences: {
        ...typePreferences,
        [type]: { ...typePreferences[type], [channel]: enabled },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading || !preferences ? (
          <p className="text-sm text-text-secondary">Loading...</p>
        ) : (
          <>
            <div className="space-y-4">
              {CHANNEL_SWITCHES.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{label}</p>
                    <p className="text-xs text-text-secondary">{description}</p>
                  </div>
                  <Toggle
                    label={label}
                    checked={preferences[key]}
                    disabled={isPending}
                    onChange={(next) => updatePreferences.mutate({ [key]: next })}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">Quiet hours</p>
                  <p className="text-xs text-text-secondary">
                    Hold notifications during a daily window.
                  </p>
                </div>
                <Toggle
                  label="Quiet hours"
                  checked={preferences.quietHoursEnabled}
                  disabled={isPending}
                  onChange={(next) =>
                    updatePreferences.mutate({ quietHoursEnabled: next })
                  }
                />
              </div>

              {preferences.quietHoursEnabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="quiet-hours-start">Start</Label>
                    <Input
                      id="quiet-hours-start"
                      type="time"
                      disabled={isPending}
                      defaultValue={toTimeInput(preferences.quietHoursStart)}
                      onBlur={(event) => {
                        const quietHoursStart = fromTimeInput(event.target.value);
                        if (quietHoursStart) {
                          updatePreferences.mutate({ quietHoursStart });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-hours-end">End</Label>
                    <Input
                      id="quiet-hours-end"
                      type="time"
                      disabled={isPending}
                      defaultValue={toTimeInput(preferences.quietHoursEnd)}
                      onBlur={(event) => {
                        const quietHoursEnd = fromTimeInput(event.target.value);
                        if (quietHoursEnd) {
                          updatePreferences.mutate({ quietHoursEnd });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <Button
                variant="ghost"
                className="w-full justify-between px-0"
                onClick={() => setShowTypes((open) => !open)}
                aria-expanded={showTypes}
              >
                <span className="text-sm font-medium text-text">
                  Per-notification settings
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-text-secondary transition-transform",
                    showTypes && "rotate-180"
                  )}
                />
              </Button>

              {showTypes && (
                <div className="mt-4 space-y-6">
                  {TYPE_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        {group.title}
                      </p>
                      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4">
                        <span className="sr-only">Notification</span>
                        <div className="flex gap-4">
                          {CHANNELS.map((channel) => (
                            <span
                              key={channel.key}
                              className="w-11 text-center text-[11px] text-text-secondary"
                            >
                              {channel.label}
                            </span>
                          ))}
                        </div>
                        {group.types.map((type) => (
                          <TypeChannelRow
                            key={type.key}
                            label={type.label}
                            typeKey={type.key}
                            typePreferences={typePreferences}
                            disabled={isPending}
                            onChange={setTypeChannel}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TypeChannelRow({
  label,
  typeKey,
  typePreferences,
  disabled,
  onChange,
}: {
  label: string;
  typeKey: string;
  typePreferences: TypePreferences;
  disabled: boolean;
  onChange: (
    type: string,
    channel: NotificationChannel,
    enabled: boolean
  ) => void;
}) {
  return (
    <>
      <span className="py-1.5 text-sm text-text">{label}</span>
      <div className="flex gap-4 py-1.5">
        {CHANNELS.map((channel) => (
          <div key={channel.key} className="flex w-11 justify-center">
            <Toggle
              label={`${label} — ${channel.label}`}
              checked={typePreferences[typeKey]?.[channel.key] !== false}
              disabled={disabled}
              onChange={(next) => onChange(typeKey, channel.key, next)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
