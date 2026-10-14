import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Bars, Ring, Sparkline } from "@/components/charts";
import { CATEGORIES, dayKey, useLogs, useTasks } from "@/lib/data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Life Analytics — LIFE.exe" },
      { name: "description", content: "30-day trends for missions, focus, steps, sleep and mood, calculated from your real logs." },
      { property: "og:title", content: "Life Analytics — LIFE.exe" },
      { property: "og:description", content: "30-day trends for missions, focus, steps, sleep and mood, calculated from your real logs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell><Analytics /></AppShell>,
});

function Analytics() {
  const from = dayKey(subDays(new Date(), 29));
  const tasksQ = useTasks(from);
  const logsQ = useLogs(from);
  const tasks = tasksQ.data ?? [];
  const logs = logsQ.data ?? [];
  const days = Array.from({ length: 30 }, (_, i) => dayKey(subDays(new Date(), 29 - i)));
  const byDay = (k: string) => logs.find((l) => l.log_date === k);
  const series = (fn: (k: string) => number) => days.map(fn);

  const doneSeries = series((k) => tasks.filter((t) => t.done && t.due_date === k).length);
  const focus = series((k) => byDay(k)?.focus_minutes ?? 0);
  const steps = series((k) => byDay(k)?.steps ?? 0);
  const sleep = series((k) => Number(byDay(k)?.sleep_hours ?? 0));
  const mood = series((k) => byDay(k)?.mood ?? 0);
  const avg = (a: number[]) => { const f = a.filter((x) => x > 0); return f.length ? f.reduce((x, y) => x + y, 0) / f.length : 0; };
  const total = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const weeks = Array.from({ length: 4 }, (_, w) => {
    const slice = doneSeries.slice(w * 7 + 2, w * 7 + 9);
    return { label: `W${w + 1}`, value: total(slice) };
  });

  if (tasksQ.isLoading || logsQ.isLoading) return <><PageHeader kicker="Stats" title="Life Analytics" /><div className="m-10 h-64 animate-pulse bg-surface" /></>;
  if (tasksQ.error || logsQ.error) return <><PageHeader kicker="Stats" title="Life Analytics" /><p className="p-10 text-magenta">Couldn't load your stats. Refresh to try again.</p></>;

  const empty = tasks.length === 0 && logs.length === 0;
  const cards = [
    { label: "Missions done", value: total(doneSeries), sub: "last 30 days", s: doneSeries, c: "var(--acid)" },
    { label: "Focus", value: `${Math.round(total(focus) / 60)}h`, sub: `avg ${Math.round(avg(focus))}m/logged day`, s: focus, c: "var(--cyan)" },
    { label: "Steps", value: Math.round(avg(steps)).toLocaleString(), sub: "avg per logged day", s: steps, c: "var(--orange)" },
    { label: "Sleep", value: `${avg(sleep).toFixed(1)}h`, sub: "avg per logged day", s: sleep, c: "var(--magenta)" },
    { label: "Mood", value: avg(mood).toFixed(1), sub: "avg out of 5", s: mood, c: "var(--acid)" },
    { label: "Days logged", value: `${logs.length}/30`, sub: "consistency", s: series((k) => (byDay(k) ? 1 : 0)), c: "var(--cyan)" },
  ];

  return (
    <>
      <PageHeader kicker="Stats" title="Life Analytics">
        <p className="mt-2 text-sm text-muted-foreground">{format(subDays(new Date(), 29), "dd MMM")} → {format(new Date(), "dd MMM yyyy")} · computed live from your logs</p>
      </PageHeader>
      <div className="space-y-8 px-5 py-8 md:px-10">
        {empty && <div className="border-2 border-dashed p-6 text-center text-muted-foreground">No data yet. Add missions and daily logs — charts fill in automatically.</div>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="panel p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
              <div className="font-mono text-3xl font-bold">{c.value}</div>
              <div className="text-[11px] text-muted-foreground">{c.sub}</div>
              <div className="mt-3"><Sparkline values={c.s} color={c.c} w={160} /></div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="panel p-5">
            <h2 className="mb-4 font-display text-xl uppercase">Missions per week</h2>
            <Bars data={weeks} height={160} color="var(--magenta)" />
          </section>
          <section className="panel p-5">
            <h2 className="mb-4 font-display text-xl uppercase">Completion by area</h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
              {CATEGORIES.map((c) => {
                const l = tasks.filter((t) => t.category === c.id);
                return (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <Ring value={l.length ? l.filter((t) => t.done).length / l.length : 0} color={c.color} size={60} stroke={6} label={l.length ? undefined : "—"} />
                    <span className="text-center text-[10px] uppercase">{c.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
