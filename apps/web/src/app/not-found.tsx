import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CircleDollarSign, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found | Fynans',
};

const suggestions = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/add', label: 'Add a transaction' },
  { href: '/basket', label: 'Basket' },
];

export default function NotFound() {
  return (
    <main className="landing-page flex min-h-screen flex-col items-center justify-center px-5 py-16 sm:px-8">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-border-light bg-surface/85 p-8 soft-shadow sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface-inverse shadow-lg shadow-primary/20">
            <CircleDollarSign className="h-6 w-6" aria-hidden />
          </div>
          <span className="text-xl font-semibold tracking-tight text-text">Fynans</span>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary-muted bg-surface-variant px-3 py-1.5 text-sm font-semibold text-primary-text">
          <Compass className="h-4 w-4" aria-hidden />
          Error 404
        </p>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          This page does not exist.
        </h1>
        <p className="mt-4 leading-7 text-text-secondary">
          The link may be out of date, or the address may have a typo in it. Nothing in your account
          has changed.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-surface-inverse shadow-lg shadow-primary/20 transition hover:bg-primary-variant"
          >
            Go home
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <nav className="mt-8 border-t border-border-light pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-text">
            Or try one of these
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.href}
                href={suggestion.href}
                className="rounded-full border border-border bg-surface px-4 py-2 text-text-secondary transition hover:border-primary/40 hover:text-primary-text"
              >
                {suggestion.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
