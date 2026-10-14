/** Original hand-drawn style decorative SVGs. */
export function Scribble({ className = "", color = "var(--magenta)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={className} aria-hidden preserveAspectRatio="none">
      <path d="M2 14 C 30 4, 50 18, 80 9 S 130 4, 160 12 S 190 8, 198 6" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
export function Star({ className = "", color = "var(--acid)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 2 L24 15 L38 16 L27 24 L31 38 L20 30 L9 38 L13 24 L2 16 L16 15 Z" fill={color} stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
export function Arrow({ className = "", color = "var(--cyan)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 40" className={className} aria-hidden>
      <path d="M4 30 C 20 6, 45 4, 70 18" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M60 8 L72 19 L57 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
