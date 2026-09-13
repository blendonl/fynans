import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export interface BalanceDrift {
  cached: Decimal;
  computed: Decimal;
  drift: Decimal;
}

export interface MemberBalanceDrift extends BalanceDrift {
  userId: string;
}

export interface FamilyBalanceReconciliation {
  familyId: string;
  family: BalanceDrift;
  members: MemberBalanceDrift[];
  isBalanced: boolean;
  repaired: boolean;
}
