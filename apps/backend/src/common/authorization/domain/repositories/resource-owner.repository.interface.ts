import { OwnedResource, ResourceOwner } from '../owned-resource';

export const RESOURCE_OWNER_REPOSITORY = 'ResourceOwnerRepository';

export interface IResourceOwnerRepository {
  findOwner(
    resource: OwnedResource,
    resourceId: string,
  ): Promise<ResourceOwner | null>;
}
