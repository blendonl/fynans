import { formatCurrency } from "@/utils/currency";
import type { TransactionItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass/glass-card";

interface TransactionItemsListProps {
  items: TransactionItem[];
}

export function TransactionItemsList({ items }: TransactionItemsListProps) {
  if (items.length === 0) return null;

  return (
    <GlassCard className="p-5 sm:p-6">
      <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4">
        Items ({items.length})
      </h3>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-3 ${
              i % 2 === 1 ? "bg-surface-variant/20 -mx-5 px-5 sm:-mx-6 sm:px-6" : ""
            } ${i < items.length - 1 ? "border-b border-border-light/30" : ""}`}
          >
            <div>
              <p className="text-sm font-medium text-text">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary">Qty: {item.quantity}</span>
                {item.discount ? (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                    {"\u2212"}{formatCurrency(item.discount)}
                  </Badge>
                ) : null}
              </div>
            </div>
            <p className="text-sm font-semibold font-mono text-text tabular-nums">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
