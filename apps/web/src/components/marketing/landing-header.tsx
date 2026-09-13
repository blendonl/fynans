'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { CircleDollarSign, Menu, X } from 'lucide-react';
import { loginHref, registerHref, sectionLinks } from '@/components/marketing/nav-links';

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const closedByNavigation = useRef(false);

  const closeForNavigation = () => {
    closedByNavigation.current = true;
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border-light bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Fynans home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-surface-inverse shadow-lg shadow-primary/20">
            <CircleDollarSign className="h-6 w-6" aria-hidden />
          </div>
          <span className="text-xl font-semibold tracking-tight text-text">Fynans</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
          {sectionLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-primary-text">
              {link.label}
            </Link>
          ))}
          <Link href={loginHref} className="transition hover:text-primary-text">
            Log in
          </Link>
          <Link
            href={registerHref}
            className="rounded-full bg-surface-inverse px-5 py-2.5 font-semibold text-text-inverse transition hover:bg-surface-inverse/90"
          >
            Get started
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={registerHref}
            className="rounded-full bg-surface-inverse px-4 py-2.5 text-sm font-semibold text-text-inverse transition hover:bg-surface-inverse/90"
          >
            Get started
          </Link>

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/85 text-text transition hover:border-primary/40"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
              <Dialog.Content
                className="fixed inset-x-0 top-0 z-50 rounded-b-[1.5rem] border-b border-border-light bg-background p-5 shadow-xl focus:outline-none"
                onCloseAutoFocus={(event) => {
                  if (!closedByNavigation.current) return;
                  closedByNavigation.current = false;
                  event.preventDefault();
                }}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-base font-semibold text-text">Menu</Dialog.Title>
                  <Dialog.Close
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:border-primary/40"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Links to the sections of this page and to signing in.
                </Dialog.Description>

                <nav className="mt-5 flex flex-col gap-1 text-base font-medium">
                  {sectionLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeForNavigation}
                      className="rounded-[var(--radius)] px-3 py-3 text-text transition hover:bg-surface"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={loginHref}
                    onClick={closeForNavigation}
                    className="rounded-[var(--radius)] px-3 py-3 text-text transition hover:bg-surface"
                  >
                    Log in
                  </Link>
                  <Link
                    href={registerHref}
                    onClick={closeForNavigation}
                    className="mt-2 rounded-full bg-surface-inverse px-5 py-3 text-center font-semibold text-text-inverse transition hover:bg-surface-inverse/90"
                  >
                    Get started
                  </Link>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
