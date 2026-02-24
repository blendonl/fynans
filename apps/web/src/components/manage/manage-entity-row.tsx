import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManageEntityRowProps {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

export function ManageEntityRow({ href, title, subtitle, badge }: ManageEntityRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-variant/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-text-secondary truncate">{subtitle}</p>
        )}
      </div>
      {badge && <Badge variant="secondary">{badge}</Badge>}
      <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary" />
    </Link>
  );
}
