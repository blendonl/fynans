import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Crop,
  EyeOff,
  ListChecks,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Store,
  Undo2,
  UsersRound,
  Zap,
} from 'lucide-react';
import { contactEmail } from '@/components/marketing/contact-email';
import { LandingHeader } from '@/components/marketing/landing-header';
import { loginHref, registerHref, sectionLinks } from '@/components/marketing/nav-links';
import { ReceiptPreview } from '@/components/marketing/receipt-preview';
import { siteDescription, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `${siteName} | Receipt-Level Expense Tracking for Households` },
  description: siteDescription,
  alternates: { canonical: '/' },
};

const features = [
  {
    icon: CheckCheck,
    title: 'Approval, not surveillance',
    description:
      'Send an expense to the family instead of straight to the ledger. Sign-off belongs to an owner or admin, and never to the person who submitted it — nobody approves their own spending.',
  },
  {
    icon: Undo2,
    title: 'Rejections come back with a reason',
    description:
      'A rejected expense keeps the note explaining why. Fix the store, the amount or the items and resubmit it for another look.',
  },
  {
    icon: EyeOff,
    title: 'Personal and family stay separate',
    description:
      'Every expense is either personal or family. The dashboard and the transaction list both filter on it, so shared planning never exposes private spending.',
  },
  {
    icon: ShoppingBasket,
    title: 'A shopping list the household shares',
    description:
      'Keep a personal basket and a family basket. Items show up for everyone as they are added, and checking out at the till turns the basket into an expense.',
  },
  {
    icon: Store,
    title: 'What things cost, store by store',
    description:
      'Every scanned product is filed against the shop you bought it in, with its price and any discount you are tracking, so you can see where it is cheaper.',
  },
  {
    icon: Zap,
    title: 'Live updates and push notifications',
    description:
      'Baskets sync over a live connection, and scans report their progress from anywhere in the app. Push tells you when an expense is waiting on the family, and when one of yours has been approved or sent back.',
  },
];

const workflow = [
  {
    icon: Camera,
    title: 'Point and shoot',
    description:
      'A guided camera finds the edges of the receipt on your phone and straightens the photo before it is uploaded.',
  },
  {
    icon: ScanLine,
    title: 'Text is extracted, then structured',
    description:
      'Text recognition runs on our own servers. Only the extracted text goes to an AI model, which returns the shop, the date, the total and every line.',
  },
  {
    icon: ListChecks,
    title: 'Check what came back',
    description:
      'Items, quantities, sizes and unit prices are all editable. Set the shop, the payment method and the spending category before you file it.',
  },
  {
    icon: BadgeCheck,
    title: 'Approve or send it back',
    description:
      'Record it confirmed, or leave it pending for the family. Sign-off falls to an owner or admin other than you, and the family balance does not move until it is approved.',
  },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Personal and family spending stay apart' },
  { icon: LockKeyhole, title: 'Receipt images live in private storage' },
  { icon: BadgeCheck, title: 'Nobody signs off their own spending' },
];

const audiences = [
  'Couples who want to agree on shared spending rather than audit it afterwards',
  'Families splitting groceries, household supplies and school costs',
  'Housemates who need shared visibility without giving up personal privacy',
];

const faqs = [
  {
    question: 'Do I need to connect a bank account?',
    answer:
      'No. Fynans starts from receipts and manual entry. You set up your own payment methods — cash or a debit card — with an opening balance, and Fynans keeps the running balance from the transactions you record.',
  },
  {
    question: 'Does Fynans do budgets?',
    answer:
      'No. There is no budget, limit or target anywhere in Fynans. What it does is record what a household actually spent, itemised down to the line on the receipt, and show it back to you by category and against the period before. If what you need is spending limits and alerts, this is not that product.',
  },
  {
    question: 'Can my partner see my personal spending?',
    answer:
      'Only what you mark as shared. Every expense carries one scope, personal or family, chosen when you record it. Family expenses go to the family; personal ones stay with you.',
  },
  {
    question: 'What happens to receipt images?',
    answer:
      'Images are stored in private object storage under a key scoped to your account, and are only ever served through short-lived signed links to you and to members of the family a receipt is shared with. Text extraction runs on our own infrastructure; only the extracted text, never the image, is sent to an AI service to structure the line items. Delete a receipt and both the file and its record are removed.',
  },
  {
    question: 'Which receipts can it read?',
    answer:
      'Scanning is tuned for Kosovo store receipts printed in Albanian — the quantity headers, the glued prices, the bag fee, the fiscal footer. Amounts are in euro. Anything the parser gets wrong you can correct on the review screen before filing it.',
  },
];

export default function Home() {
  return (
    <main className="landing-page overflow-hidden">
      <LandingHeader />
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-muted bg-surface/85 px-3 py-2 text-sm font-medium text-primary-text shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
            Receipt-first expense tracking for shared households
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-text sm:text-6xl lg:text-7xl">
            Scan the receipt. Let the household agree on it.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
            Fynans turns a photo of a store receipt into an itemised expense — shop, date, products,
            quantities and prices — and can hold it for your family to approve before it counts.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-surface-inverse shadow-lg shadow-primary/20 transition hover:bg-primary-variant"
            >
              Start tracking receipts
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/85 px-6 py-3 text-base font-semibold text-text transition hover:border-primary/40 hover:text-primary-text"
            >
              Log in
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
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
        <ReceiptPreview />
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-text">
            Built around real purchases
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Shared money works better when everyone can see the receipt and say something about it.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-text">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              From a paper receipt to an agreed expense in four steps.
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-text">
            Designed for shared money
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            A household is people, not one merged account.
          </h2>
          <p className="mt-5 leading-8 text-text-secondary">
            Invite the people you actually share costs with, give them a role, and let the
            transactions carry their own history — who recorded it, whether it was approved, and
            what was said if it went back.
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
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-text">Roles that mean something.</h3>
            <p className="mt-3 leading-7 text-text-secondary">
              Invite by email and the invitation lapses on its own if nobody acts on it. Owners and
              admins hold the sign-off; members record spending against the same shared balance.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border-light bg-surface p-6 soft-shadow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-muted text-primary">
              <Crop className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-text">Capture built for a phone.</h3>
            <p className="mt-3 leading-7 text-text-secondary">
              Edge detection and cropping run in the browser, on the phone, before anything is
              uploaded. Queue several receipts at once and keep using the app while they process.
            </p>
          </div>
          <div className="rounded-[var(--radius)] border border-border-light bg-surface p-6 soft-shadow sm:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-info/10 text-info">
              <Smartphone className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-text">
              Installs to your home screen.
            </h3>
            <p className="mt-3 leading-7 text-text-secondary">
              Fynans is a progressive web app. Add it to your home screen and it opens like any
              other app, with the capture engine cached so it is ready the moment you are standing
              at the till.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-text">
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
        <div className="rounded-[1.5rem] bg-surface-inverse px-6 py-12 text-text-inverse sm:px-10 lg:px-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">
                Start with the next receipt
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Keep the receipt. Skip the argument about what it was for.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={registerHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-light px-6 py-3 font-semibold text-surface-inverse transition hover:bg-primary"
              >
                Create account
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center rounded-full border border-text-inverse/20 px-6 py-3 font-semibold text-text-inverse transition hover:bg-text-inverse/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-light bg-surface/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-text-secondary sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div>
          <div className="flex items-center gap-3 text-text">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-surface-inverse">
              <CircleDollarSign className="h-5 w-5" aria-hidden />
            </div>
            <span className="font-semibold">Fynans</span>
          </div>
          <p className="mt-3">Receipt-level expense tracking for shared households.</p>
        </div>
        <nav className="flex flex-wrap gap-5 font-medium">
          {sectionLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-primary-text">
              {link.label}
            </Link>
          ))}
          <Link href="/privacy" className="transition hover:text-primary-text">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-primary-text">
            Terms
          </Link>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="transition hover:text-primary-text"
            >
              Contact
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
