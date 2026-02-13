export function FynansLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fynans-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#181B20" />
          <stop offset="100%" stopColor="#0F1114" />
        </linearGradient>
        <linearGradient id="fynans-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8BE4A" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#fynans-bg)" />
      <rect x="96" y="296" width="76" height="112" rx="14" fill="url(#fynans-bar)" opacity="0.6" />
      <rect x="218" y="216" width="76" height="192" rx="14" fill="url(#fynans-bar)" opacity="0.8" />
      <rect x="340" y="136" width="76" height="272" rx="14" fill="url(#fynans-bar)" />
      <circle cx="378" cy="108" r="18" fill="#6BAFAF" />
    </svg>
  );
}
