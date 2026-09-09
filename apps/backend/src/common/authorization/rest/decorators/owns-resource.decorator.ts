import { SetMetadata } from '@nestjs/common';
import { OwnedResource } from '../../domain/owned-resource';

export type ResourceIdSource = 'param' | 'query' | 'body';

export interface OwnsResourceRule {
  resource: OwnedResource;
  source?: ResourceIdSource;
  key?: string;
  optional?: boolean;
}

export const OWNS_RESOURCE_KEY = 'owns_resource_rules';

export const OwnsResource = (...rules: OwnsResourceRule[]) =>
  SetMetadata(OWNS_RESOURCE_KEY, rules);
