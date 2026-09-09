"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "./user-avatar";

export function AccountSection() {
  const { profile, isLoading, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!isEditing && profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setImage(profile.image ?? "");
    }
  }, [isEditing, profile]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedImage = image.trim();

    updateProfile.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        image: trimmedImage === "" ? null : trimmedImage,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Account</CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit profile"
            disabled={isLoading || !profile}
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-text-secondary">Loading...</p>
        ) : !isEditing ? (
          <div className="flex items-center gap-4">
            <UserAvatar
              image={profile?.image}
              firstName={profile?.firstName}
              lastName={profile?.lastName}
              className="h-16 w-16"
              fallbackClassName="text-2xl font-bold"
            />
            <div className="min-w-0">
              <p className="text-lg font-medium text-text truncate">
                {profile?.firstName} {profile?.lastName}
              </p>
              <p className="text-sm text-text-secondary truncate">{profile?.email}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                image={image.trim() || null}
                firstName={firstName}
                lastName={lastName}
                className="h-16 w-16"
                fallbackClassName="text-2xl font-bold"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="profile-image">Avatar URL</Label>
                <Input
                  id="profile-image"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/avatar.png"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-first-name">First name</Label>
                <Input
                  id="profile-first-name"
                  value={firstName}
                  maxLength={100}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="profile-last-name">Last name</Label>
                <Input
                  id="profile-last-name"
                  value={lastName}
                  maxLength={100}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={profile?.email ?? ""} disabled readOnly />
              <p className="mt-1.5 pl-1 text-xs text-text-secondary">
                Email changes are not available yet — they need email verification.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
