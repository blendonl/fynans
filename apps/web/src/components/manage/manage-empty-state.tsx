import { Package } from "lucide-react";

interface ManageEmptyStateProps {
  entity: string;
}

export function ManageEmptyState({ entity }: ManageEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-surface-variant p-3 mb-3">
        <Package className="h-6 w-6 text-text-secondary" />
      </div>
      <p className="text-sm text-text-secondary">No {entity} found</p>
    </div>
  );
}
