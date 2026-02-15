import type { ReactNode } from "react";

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ label, title, description, children, className }: PageHeaderProps) {
  const hasActions = !!children;

  const header = (
    <div>
      {label && (
        <p className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
          {label}
        </p>
      )}
      <h1 className="text-xl sm:text-2xl font-bold text-text mt-1">{title}</h1>
      {description && (
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      )}
    </div>
  );

  if (!hasActions) {
    return <div className={className}>{header}</div>;
  }

  return (
    <div className={`lg:flex lg:items-end lg:justify-between lg:gap-6 ${className ?? ""}`}>
      {header}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 lg:shrink-0">
        {children}
      </div>
    </div>
  );
}
