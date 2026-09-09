export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

export function ContactEmail() {
  if (!contactEmail) {
    return <LegalPlaceholder>CONTACT EMAIL</LegalPlaceholder>;
  }

  return (
    <a
      href={`mailto:${contactEmail}`}
      className="font-medium text-primary-text underline underline-offset-4 transition hover:text-text"
    >
      {contactEmail}
    </a>
  );
}

export function LegalPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-warning/40 bg-warning/15 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold uppercase tracking-wide text-text">
      [{children}]
    </span>
  );
}
