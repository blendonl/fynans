import Link from 'next/link';
import { ArrowLeft, CircleDollarSign, FileWarning } from 'lucide-react';

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  summary: React.ReactNode;
  children: React.ReactNode;
};

export function LegalPage({ title, lastUpdated, summary, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border-light bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Fynans home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface-inverse shadow-lg shadow-primary/20">
              <CircleDollarSign className="h-6 w-6" aria-hidden />
            </div>
            <span className="text-xl font-semibold tracking-tight text-text">Fynans</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary-variant"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm font-medium text-text-secondary">Last updated: {lastUpdated}</p>

        <div className="mt-8 flex gap-4 rounded-[var(--radius)] border border-warning/30 bg-warning/10 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning text-surface-inverse">
            <FileWarning className="h-5 w-5" aria-hidden />
          </div>
          <p className="self-center text-sm leading-6 text-text-secondary">
            <span className="font-semibold text-text">Draft.</span> This document has not been
            reviewed by a lawyer. Highlighted values are placeholders that must be completed before
            Fynans is offered publicly.
          </p>
        </div>

        <div className="mt-8 rounded-[var(--radius)] border border-border-light bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            In short
          </h2>
          <div className="mt-4 space-y-3 leading-7 text-text-secondary">{summary}</div>
        </div>

        <div className="mt-12 space-y-12">{children}</div>
      </article>

      <footer className="border-t border-border-light bg-surface/70">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-5 px-5 py-8 text-sm font-medium text-text-secondary sm:px-8">
          <Link href="/" className="transition hover:text-primary-variant">
            Home
          </Link>
          <Link href="/privacy" className="transition hover:text-primary-variant">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-primary-variant">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight text-text">{heading}</h2>
      <div className="mt-4 space-y-4 leading-7 text-text-secondary">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="ml-1 space-y-3 border-l border-border-light pl-5">{children}</ul>;
}

export function LegalItem({ term, children }: { term?: string; children: React.ReactNode }) {
  return (
    <li className="leading-7">
      {term ? <span className="font-semibold text-text">{term} </span> : null}
      {children}
    </li>
  );
}
