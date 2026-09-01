export function Enso({ className = "enso" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" pathLength="100" strokeDasharray="86 14" />
      <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.16" />
    </svg>
  );
}
