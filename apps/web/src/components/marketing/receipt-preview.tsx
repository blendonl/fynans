import { ShieldCheck } from 'lucide-react';

const store = {
  name: 'Market Extra',
  location: 'Prishtinë',
  total: '€9.17',
  category: 'Groceries',
};

const lineItems = [
  { name: 'Buke Bardhe', measure: '2 × €0.79', total: '€1.58' },
  { name: 'Qumesht 1 l', measure: '3 × €1.05', total: '€3.15' },
  { name: 'Pemeperime', measure: '1.5 kg × €0.60', total: '€0.90' },
  { name: 'Detergjent Enesh', measure: '1 × €3.49', total: '€3.49' },
  { name: 'Qese Plastike', measure: '1 × €0.05', total: '€0.05' },
];

const categorySpend = [
  { label: 'Groceries', value: '€684', color: 'bg-primary', width: 'w-full' },
  { label: 'Household', value: '€312', color: 'bg-secondary', width: 'w-[46%]' },
  { label: 'Transport', value: '€168', color: 'bg-info', width: 'w-[25%]' },
];

export function ReceiptPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 via-surface/40 to-secondary/20 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-glass-border bg-glass-bg-strong p-4 soft-shadow backdrop-blur sm:p-5">
        <div className="rounded-[1.25rem] border border-border-light bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary">Receipt processed</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-text">{store.name}</p>
              <p className="mt-1 text-sm text-text-secondary">{store.location}</p>
            </div>
            <div className="rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success">
              {lineItems.length} items parsed
            </div>
          </div>

          <div className="mt-6 rounded-[var(--radius)] bg-surface-variant p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold text-text">Line items</h2>
              <span className="text-sm font-semibold text-text">{store.total}</span>
            </div>
            <p className="mb-4 text-xs text-text-secondary">
              Read straight off an Albanian receipt
            </p>
            <div className="space-y-2">
              {lineItems.map((line) => (
                <div
                  key={line.name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text">{line.name}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{line.measure}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-text">{line.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[var(--radius)] bg-surface-inverse p-4 text-text-inverse">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text-inverse/12">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-surface-inverse">
                  Family
                </span>
              </div>
              <p className="text-sm text-text-inverse/60">Waiting for approval</p>
              <p className="mt-1 text-2xl font-semibold">{store.total}</p>
              <p className="mt-4 text-sm leading-6 text-text-inverse/70">
                Filed under {store.category}. An owner or admin approves it — never the person who
                submitted it — or sends it back with a reason.
              </p>
            </div>
            <div className="rounded-[var(--radius)] bg-surface-variant p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-text">Spending by category</h2>
                <span className="text-sm text-text-secondary">Last 30 days</span>
              </div>
              <div className="space-y-4">
                {categorySpend.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{row.label}</span>
                      <span className="font-medium text-text">{row.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface">
                      <div className={`${row.color} ${row.width} h-2 rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
