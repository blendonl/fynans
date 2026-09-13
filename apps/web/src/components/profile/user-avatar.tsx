"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  image?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  className?: string;
  fallbackClassName?: string;
}

function initialsOf(firstName?: string | null, lastName?: string | null): string {
  const initials = `${firstName?.trim()[0] ?? ""}${lastName?.trim()[0] ?? ""}`;
  return initials.toUpperCase() || "?";
}

export function UserAvatar({
  image,
  firstName,
  lastName,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = initialsOf(firstName, lastName);

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {image ? <AvatarImage src={image} alt={initials} /> : null}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-sm font-medium text-primary",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
