export class OwnerScope {
  constructor(
    readonly userId: string,
    readonly familyIds: string[],
  ) {}

  get hasFamilies(): boolean {
    return this.familyIds.length > 0;
  }
}
