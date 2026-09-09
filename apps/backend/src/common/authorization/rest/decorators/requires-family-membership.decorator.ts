import { SetMetadata } from '@nestjs/common';
import { FamilyMemberRole } from '../../domain/family-role';

export type FamilyIdSource = 'param' | 'query' | 'body';

export interface FamilyScopeRule {
  sources?: FamilyIdSource[];
  key?: string;
  required?: boolean;
  roles?: FamilyMemberRole[];
}

export const FAMILY_SCOPE_KEY = 'family_scope_rule';

export const DEFAULT_FAMILY_ID_SOURCES: FamilyIdSource[] = [
  'param',
  'query',
  'body',
];

export const DEFAULT_FAMILY_ID_KEY = 'familyId';

export const RequiresFamilyMembership = (rule: FamilyScopeRule = {}) =>
  SetMetadata(FAMILY_SCOPE_KEY, rule);

export const RequiresFamilyRole = (...roles: FamilyMemberRole[]) =>
  RequiresFamilyMembership({ roles });
