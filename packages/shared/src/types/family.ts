export interface Family {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  role: FamilyMemberRole;
  balance: number;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export type FamilyMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export interface FamilyWithMembers extends Family {
  members: FamilyMember[];
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  inviterId: string;
  inviteeEmail: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}
