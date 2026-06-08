import type { Metadata } from 'next';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  EyeOff,
  FileCheck2,
  FileText,
  HandCoins,
  LockKeyhole,
  PieChart,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Split,
  Tags,
  UsersRound,
} from 'lucide-react';

const registerHref = '/register';
const loginHref = '/login';

export const metadata: Metadata = {
  title: 'Fynans | Receipt-Level Household Budgeting',
  description:
    'Scan receipts, categorize line items, and understand shared household spending without losing personal context.',
};

const features = [
  {
    icon: Split,
    title: 'Split receipts by line item',
    description:
      "Put groceries, household supplies, kids' purchases, and one-off items where they actually belong.",
  },
  {
    icon: EyeOff,
    title: 'Coordinate without exposing everything',
    description:
      'Keep shared household planning separate from personal spending that does not need a group discussion.',
  },
  {
    icon: Tags,
    title: 'Use categories that match real life',
    description:
      'Track Costco runs, school supplies, pets, dining, and recurring household patterns without spreadsheet cleanup.',
  },
  {
    icon: HandCoins,
    title: 'Review spending before it becomes friction',
    description:
      'See what changed, which shared budgets moved, and what needs a conversation while the context is still fresh.',
  },
];

const workflow = [
  {
    icon: Camera,
    title: 'Scan the receipt',
    description: 'Capture the purchase when it happens instead of reconstructing it later.',
  },
  {
    icon: ReceiptText,
    title: 'Review parsed items',
    description: 'Check line items, totals, and merchants before they hit your household view.',
  },
  {
    icon: Tags,
    title: 'Assign real categories',
    description:
      'Separate groceries, home, kids, dining, and personal items from the same receipt.',
  },
  {
    icon: PieChart,
    title: 'See the budget impact',
    description: 'Understand how one purchase affected shared and personal spending.',
  },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Personal and shared views stay separate' },
  { icon: LockKeyhole, title: 'Receipt data stays tied to your household' },
  { icon: BadgeCheck, title: 'Built for collaboration, not surveillance' },
];

const receiptItems = [
  { item: 'Organic milk', price: '$5.49', category: 'Groceries', owner: 'Shared' },
  { item: 'Laundry soap', price: '$13.99', category: 'Household', owner: 'Shared' },
  { item: 'School snacks', price: '$9.45', category: 'Kids', owner: 'Shared' },
  { item: 'Headphones', price: '$24.99', category: 'Personal', owner: 'Mia' },
];

const categoryRows = [
  { label: 'Groceries', value: '$684', color: 'bg-primary', width: 'w-[86%]' },
  { label: 'Household', value: '$312', color: 'bg-secondary', width: 'w-[58%]' },
  { label: 'Kids', value: '$226', color: 'bg-info', width: 'w-[42%]' },
  { label: 'Dining', value: '$168', color: 'bg-warning', width: 'w-[32%]' },
];

const audiences = [
  'Couples who plan shared spending together',
  'Families tracking groceries, kids, school, and household costs',
  'Roommates or households that want shared visibility without blurred ownership',
];

const faqs = [
  {
    question: 'Do I need to connect a bank account?',
    answer:
      'No. Fynans can start from receipts, which makes it useful before any account syncing is added or required.',
  },
  {
    question: 'Can my partner see personal spending?',
    answer:
      'The product is designed around distinct shared and personal views, so household planning does not have to expose every private purchase.',
  },
  {
    question: 'What happens to receipt images?',
    answer:
      'Receipt data should be treated as household financial data. The landing page now states that receipts stay tied to your household and should link to a full privacy policy before launch.',
  },
  {
    question: 'Is this budgeting or expense splitting?',
    answer:
      'It is receipt-first household budgeting. Splitting can be part of the workflow, but the core value is understanding where real purchases went.',
  },
];

export default function Home() {
  return (
    <main className="landing-page overflow-hidden">
      <Header />
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-muted bg-surface/85 px-3 py-2 text-sm font-medium text-primary-variant shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
            Receipt-first finance for shared households
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-text sm:text-6xl lg:text-7xl">
            Receipt-level budgeting for households.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
            Fynans helps households scan receipts, categorize line items, and understand shared
            spending without losing personal context.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={registerHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-variant"
            >
              Start tracking receipts
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={loginHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/85 px-6 py-3 text-base font-semibold text-text transition hover:border-primary/40 hover:text-primary-variant"
            >
              Log in
              <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-[var(--radius)] border border-border-light bg-surface/75 p-4 text-sm font-medium text-text"
              >
                <item.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                {item.title}
              </div>
            ))}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Built around real purchases
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Household budgeting gets easier when every receipt keeps its context.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[var(--radius)] border border-border-light bg-surface/85 p-6 soft-shadow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-muted text-primary">
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-text">{feature.title}</h3>
              <p className="mt-3 leading-7 text-text-secondary">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface/60 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Go from a messy purchase to a household-ready budget update.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[var(--radius)] border border-border-light bg-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-muted text-primary">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="text-sm font-semibold text-text-disabled">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-text">{step.title}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Designed for shared money
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            See what belongs to the household and what should stay personal.
          </h2>
          <p className="mt-5 leading-8 text-text-secondary">
            Most finance apps treat a purchase as one transaction. Fynans starts one level deeper,
            so a single store run can become useful categories, clear ownership, and a better
            household conversation.
          </p>
          <div className="mt-8 space-y-3">
            {audiences.map((audience) => (
              <div key={audience} className="flex items-start gap-3 text-text-secondary">
                <Check className="mt-1 h-5 w-5 shrink-0 text-success" aria-hidden />
                <span>{audience}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border-light bg-surface p-6 soft-shadow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <FileCheck2 className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-text">Receipt details stay useful.</h3>
            <p className="mt-3 leading-7 text-text-secondary">
              Preserve merchant, item, category, and ownership context instead of flattening every
              purchase into one total.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border-light bg-surface p-6 soft-shadow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-muted text-primary">
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-text">Shared does not mean exposed.</h3>
            <p className="mt-3 leading-7 text-text-secondary">
              Household budgets can stay collaborative while personal purchases keep the right level
              of privacy.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              The details matter when the product touches money.
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-[var(--radius)] border border-border-light bg-surface p-6"
              >
                <h3 className="text-lg font-semibold text-text">{faq.question}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="rounded-[1.5rem] bg-text px-6 py-12 text-white sm:px-10 lg:px-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">
                Start with the next receipt
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Turn household purchases into spending clarity while the context is still fresh.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={registerHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-light px-6 py-3 font-semibold text-text transition hover:bg-white"
              >
                Create account
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href={loginHref}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-light bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="/" className="flex items-center gap-3" aria-label="Fynans home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <CircleDollarSign className="h-6 w-6" aria-hidden />
          </div>
          <span className="text-xl font-semibold tracking-tight text-text">Fynans</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
          <a href="#features" className="transition hover:text-primary-variant">
            Features
          </a>
          <a href="#faq" className="transition hover:text-primary-variant">
            FAQ
          </a>
          <a href={loginHref} className="transition hover:text-primary-variant">
            Log in
          </a>
          <a
            href={registerHref}
            className="rounded-full bg-text px-5 py-2.5 font-semibold text-white transition hover:bg-primary-variant"
          >
            Get started
          </a>
        </nav>
        <a
          href={registerHref}
          className="rounded-full bg-text px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-variant md:hidden"
        >
          Get started
        </a>
      </div>
    </header>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 via-white/40 to-secondary/20 blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-white/70 bg-glass-bg-strong p-4 soft-shadow backdrop-blur sm:p-5">
        <div className="rounded-[1.25rem] border border-border-light bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary">Receipt captured</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-text">Fresh Market</p>
            </div>
            <div className="rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success">
              4 items parsed
            </div>
          </div>
          <div className="mt-6 rounded-[var(--radius)] bg-surface-variant p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-text">Line-item review</h3>
              <span className="text-sm text-text-secondary">$53.92 total</span>
            </div>
            <div className="space-y-3">
              {receiptItems.map((item) => (
                <div
                  key={item.item}
                  className="grid gap-3 rounded-xl bg-surface p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" aria-hidden />
                      <span className="font-medium text-text">{item.item}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-primary-muted px-2.5 py-1 text-primary-variant">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-surface-variant px-2.5 py-1 text-text-secondary">
                        {item.owner}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-text">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[var(--radius)] bg-text p-4 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-text">
                  Shared
                </span>
              </div>
              <p className="text-sm text-white/60">Household impact</p>
              <p className="mt-1 text-2xl font-semibold">$28.93</p>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Groceries, household, and kids' items move into shared budgets.
              </p>
            </div>
            <div className="rounded-[var(--radius)] bg-surface-variant p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-text">Month by category</h3>
                <span className="text-sm text-text-secondary">May</span>
              </div>
              <div className="space-y-4">
                {categoryRows.slice(0, 3).map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{row.label}</span>
                      <span className="font-medium text-text">{row.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white">
                      <div className={row.color + ' ' + row.width + ' h-2 rounded-full'} />
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

function Footer() {
  return (
    <footer className="border-t border-border-light bg-surface/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-text-secondary sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div>
          <div className="flex items-center gap-3 text-text">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <CircleDollarSign className="h-5 w-5" aria-hidden />
            </div>
            <span className="font-semibold">Fynans</span>
          </div>
          <p className="mt-3">Receipt-level budgeting for shared households.</p>
        </div>
        <nav className="flex flex-wrap gap-5 font-medium">
          <a href="#features" className="transition hover:text-primary-variant">
            Features
          </a>
          <a href="#faq" className="transition hover:text-primary-variant">
            FAQ
          </a>
          <a href="/privacy" className="transition hover:text-primary-variant">
            Privacy
          </a>
          <a href="/terms" className="transition hover:text-primary-variant">
            Terms
          </a>
          <a href="mailto:hello@fynans.app" className="transition hover:text-primary-variant">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
