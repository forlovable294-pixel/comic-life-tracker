import { useEffect, useState } from "react";

/** Animated progress ring. value 0..1 */
export function Ring({ value, color = "var(--acid)", size = 84, stroke = 8, label, sub }: {
  value: number; color?: string; size?: number; stroke?: number; label?: string; sub?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(Math.max(0, Math.min(1, value))), 60); return () => clearTimeout(t); }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} strokeDasharray="3 4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="butt"
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="font-mono text-sm font-bold">{label ?? `${Math.round(value * 100)}%`}</div>
        {sub && <div className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

/** Paired bar chart: current vs previous series. */
export function Bars({ data, color = "var(--acid)", ghost = "var(--border)", height = 120 }: {
  data: { label: string; value: number; prev?: number }[]; color?: string; ghost?: string; height?: number;
}) {
  const max = Math.max(1, ...data.flatMap((d) => [d.value, d.prev ?? 0]));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="relative flex w-full flex-1 items-end justify-center gap-[3px]">
            {d.prev != null && (
              <div className="w-1/3 halftone" style={{ height: `${(d.prev / max) * 100}%`, color: ghost, background: undefined, minHeight: 2 }} title={`Last week: ${d.prev}`} />
            )}
            <div className="w-1/2 reveal" style={{ height: `${(d.value / max) * 100}%`, background: color, minHeight: 2, animationDelay: `${i * 40}ms` }} title={`${d.value}`} />
          </div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, color = "var(--cyan)", w = 120, h = 32 }: { values: number[]; color?: string; w?: number; h?: number }) {
  if (values.length < 2) return <div className="font-mono text-[10px] text-muted-foreground">not enough data</div>;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
