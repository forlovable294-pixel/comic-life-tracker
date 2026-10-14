import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, subDays, parseISO, differenceInCalendarDays } from "date-fns";
import { Check, Trash2, Flame, Footprints, Timer, BookOpen, Dumbbell, HeartPulse, ListChecks, Gauge, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Ring, Bars } from "@/components/charts";
import { Scribble, Star, Arrow } from "@/components/doodles";
import {
  CATEGORIES, catMeta, dayKey, logCoverage, useDeleteTask, useLogs, useProfile, useTasks, useUpdateProfile, useUpdateTask, type Task,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIFE.exe — Command Center" },
      { name: "description", content: "Your personal life operating system: missions, stats, streaks and momentum at a glance." },
      { property: "og:title", content: "LIFE.exe — Command Center" },
      { property: "og:description", content: "Your personal life operating system: missions, stats, streaks and momentum at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AppShell><Dashboard /></AppShell>,
});

const QUOTES = [
  "Main character energy. Side quest discipline.",
  "Small reps. Big arc.",
  "You don't need motivation. You need a next step.",
  "Log it, or it didn't happen.",
  "Consistency is the cheat code.",
  "Every boss fight starts with one hit.",
];

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function Dashboard() {
  const now = useNow();
  const today = dayKey();
  const tasksQ = useTasks();
  const logsQ = useLogs(dayKey(subDays(new Date(), 60)));
  const profile = useProfile();
  const tasks = tasksQ.data ?? [];
  const logs = logsQ.data ?? [];
  const todayLog = logs.find((l) => l.log_date === today);

  const todays = tasks.filter((t) => t.due_date === today || (!t.done && t.due_date < today));
  const done = todays.filter((t) => t.done).length;
  const completion = todays.length ? done / todays.length : 0;

  const streak = useMemo(() => {
    const set = new Set(logs.map((l) => l.log_date));
    let d = set.has(today) ? new Date() : subDays(new Date(), 1);
    let n = 0;
    while (set.has(dayKey(d))) { n++; d = subDays(d, 1); }
    return n;
  }, [logs, today]);

  const hour = now?.getHours() ?? 12;
  const greet = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const quote = QUOTES[(now ? now.getDate() : 0) % QUOTES.length];
  const loading = tasksQ.isLoading || logsQ.isLoading;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 speed-lines px-5 pb-8 pt-8 md:px-10">
        <Star className="absolute right-6 top-6 size-10 rotate-12 md:right-16" />
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="sticker -rotate-2 bg-cyan text-ink">{now ? format(now, "EEE · dd MMM yyyy") : "—"}</span>
              <span className="font-mono text-sm text-acid">{now ? format(now, "HH:mm:ss") : "--:--:--"}</span>
            </div>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] md:text-7xl">
              {greet},<br /><span className="outline-text">{profile.data?.display_name ?? "player"}</span>
            </h1>
            <Scribble className="mt-1 h-4 w-56" />
            <p className="mt-3 max-w-md text-muted-foreground">“{quote}”</p>
            <StatusEditor value={profile.data?.status ?? ""} />
          </div>
          <div className="panel panel-pop flex items-center gap-4 p-4">
            <Ring value={completion} size={104} stroke={10} sub="today" />
            <div className="font-mono text-xs leading-relaxed text-muted-foreground">
              <div><span className="text-foreground">{done}</span>/{todays.length} missions</div>
              <div><span className="text-foreground">{Math.round(logCoverage(todayLog) * 100)}%</span> day logged</div>
              <div className="flex items-center gap-1"><Flame className="size-3 text-orange" /><span className="text-foreground">{streak}</span> day log streak</div>
              <div className="mt-1 max-w-36 text-[10px]">Ring = missions done ÷ missions due today.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 px-5 md:px-10 xl:grid-cols-[1.4fr_1fr]">
        <MissionBoard tasks={todays} loading={loading} />
        <DailyStats log={todayLog} done={done} planned={todays.length} streak={streak} />
      </div>

      <div className="px-5 md:px-10"><LifeOverview tasks={tasks} /></div>

      <div className="grid gap-8 px-5 md:px-10 xl:grid-cols-2">
        <Momentum tasks={tasks} logs={logs} />
        <Timeline tasks={tasks} logs={logs} />
      </div>
    </div>
  );
}

function StatusEditor({ value }: { value: string }) {
  const upd = useUpdateProfile();
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const presets = ["Locked in", "Touching grass", "Surviving the academic boss fight", "Recharging"];
  if (!edit) return (
    <button onClick={() => setEdit(true)} className="mt-4 inline-flex items-center gap-2 border-2 border-dashed px-3 py-1.5 text-sm hover:border-acid">
      <span className="size-2 animate-pulse bg-acid" /> Status: <b>{value || "set a status"}</b><Pencil className="size-3 text-muted-foreground" />
    </button>
  );
  return (
    <form className="mt-4 flex max-w-lg flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); await upd.mutateAsync({ status: v.trim().slice(0, 80) }); setEdit(false); }}>
      <input autoFocus className="field flex-1" maxLength={80} value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn-ink">Save</button>
      <div className="flex w-full flex-wrap gap-1">
        {presets.map((p) => <button type="button" key={p} onClick={() => setV(p)} className="border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">{p}</button>)}
      </div>
    </form>
  );
}

const BUCKETS = [
  { id: "must", label: "Must do", color: "bg-magenta" },
  { id: "should", label: "Should do", color: "bg-cyan" },
  { id: "side", label: "Side quests", color: "bg-acid" },
] as const;

function MissionBoard({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  return (
    <section className="panel panel-pop p-5">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl uppercase">Today's mission board</h2>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">press N to add</span>
      </div>
      {loading ? <div className="h-40 animate-pulse bg-surface-2" /> : tasks.length === 0 ? (
        <div className="relative grid place-items-center border-2 border-dashed py-10 text-center">
          <Arrow className="absolute right-10 top-3 h-8 w-16 -scale-x-100" />
          <p className="font-display text-xl uppercase">No missions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Hit the quick-add button to plan your day.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {BUCKETS.map((b) => {
            const list = tasks.filter((t) => t.bucket === b.id);
            return (
              <div key={b.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`size-3 ${b.color}`} />
                  <span className="font-mono text-xs font-bold uppercase">{b.label}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{list.filter((t) => t.done).length}/{list.length}</span>
                </div>
                <ul className="space-y-2">
                  {list.map((t) => <TaskRow key={t.id} t={t} />)}
                  {list.length === 0 && <li className="border border-dashed p-3 text-xs text-muted-foreground">Empty</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TaskRow({ t }: { t: Task }) {
  const upd = useUpdateTask();
  const del = useDeleteTask();
  const [open, setOpen] = useState(false);
  const overdue = !t.done && t.due_date < dayKey();
  return (
    <li className={`group border-2 bg-ink p-2.5 transition ${t.done ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-2">
        <button aria-label={t.done ? "Mark not done" : "Mark done"}
          onClick={() => upd.mutate({ id: t.id, done: !t.done, completed_at: !t.done ? new Date().toISOString() : null })}
          className={`mt-0.5 grid size-5 shrink-0 place-items-center border-2 ${t.done ? "border-acid bg-acid text-ink" : "border-muted-foreground hover:border-acid"}`}>
          {t.done && <Check className="size-3" strokeWidth={4} />}
        </button>
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <div className={`text-sm font-medium leading-snug ${t.done ? "line-through" : ""}`}>{t.title}</div>
          <div className="mt-1 flex flex-wrap gap-x-2 font-mono text-[10px] uppercase text-muted-foreground">
            <span style={{ color: catMeta(t.category).color }}>{catMeta(t.category).label}</span>
            <span>P{t.priority}</span>
            {t.estimate_minutes ? <span>{t.estimate_minutes}m</span> : null}
            {overdue && <span className="text-magenta">overdue · {format(parseISO(t.due_date), "dd MMM")}</span>}
          </div>
        </button>
        <button aria-label="Delete" onClick={() => del.mutate(t.id)} className="text-muted-foreground opacity-0 hover:text-magenta group-hover:opacity-100 focus:opacity-100"><Trash2 className="size-4" /></button>
      </div>
      {open && t.notes && <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">{t.notes}</p>}
    </li>
  );
}

function DailyStats({ log, done, planned, streak }: { log?: import("@/lib/data").DailyLog; done: number; planned: number; streak: number }) {
  const tiles = [
    { icon: ListChecks, label: "Missions", value: `${done}/${planned}`, to: "/", color: "text-acid" },
    { icon: Timer, label: "Focus", value: `${log?.focus_minutes ?? 0}m`, to: "/log", color: "text-cyan" },
    { icon: Footprints, label: "Steps", value: (log?.steps ?? 0).toLocaleString(), to: "/log", color: "text-orange" },
    { icon: Dumbbell, label: "Workout", value: log?.workout_done ? "Done" : "Not yet", to: "/log", color: "text-magenta" },
    { icon: HeartPulse, label: "Cardio", value: `${log?.cardio_minutes ?? 0}m`, to: "/log", color: "text-cyan" },
    { icon: BookOpen, label: "Learning", value: `${log?.learning_minutes ?? 0}m`, to: "/log", color: "text-acid" },
    { icon: Flame, label: "Log streak", value: `${streak}d`, to: "/analytics", color: "text-orange" },
    { icon: Gauge, label: "Day logged", value: `${Math.round(logCoverage(log) * 100)}%`, to: "/log", color: "text-magenta" },
  ];
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl uppercase">Daily stats</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="group border-2 bg-surface p-3 transition hover:-translate-y-0.5 hover:border-acid">
            <t.icon className={`size-4 ${t.color}`} />
            <div className="mt-2 font-mono text-xl font-bold">{t.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
          </Link>
        ))}
      </div>
      {!log && <p className="mt-3 text-xs text-muted-foreground">Nothing logged today yet — <Link to="/log" className="text-acid underline">open the Daily Log</Link>.</p>}
    </section>
  );
}

const LS_KEY = "life.exe.overview.cats";
function LifeOverview({ tasks }: { tasks: Task[] }) {
  const [shown, setShown] = useState<string[]>(CATEGORIES.slice(0, 8).map((c) => c.id));
  const [editing, setEditing] = useState(false);
  useEffect(() => { try { const s = localStorage.getItem(LS_KEY); if (s) setShown(JSON.parse(s)); } catch { /* ignore */ } }, []);
  const toggle = (id: string) => {
    const next = shown.includes(id) ? shown.filter((x) => x !== id) : [...shown, id];
    setShown(next); localStorage.setItem(LS_KEY, JSON.stringify(next));
  };
  const week = dayKey(subDays(new Date(), 6));
  const recent = tasks.filter((t) => t.due_date >= week);
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <h2 className="font-display text-2xl uppercase">Life overview</h2>
        <span className="text-xs text-muted-foreground">Missions completed per area, last 7 days</span>
        <button onClick={() => setEditing(!editing)} className="btn-ghost-ink ml-auto py-1 text-[11px]">{editing ? "Done" : "Customize"}</button>
      </div>
      {editing && (
        <div className="mb-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => toggle(c.id)} className={`border-2 px-2 py-1 text-xs ${shown.includes(c.id) ? "border-acid text-acid" : "text-muted-foreground"}`}>{c.label}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {CATEGORIES.filter((c) => shown.includes(c.id)).map((c, i) => {
          const list = recent.filter((t) => t.category === c.id);
          const d = list.filter((t) => t.done).length;
          return (
            <div key={c.id} className={`flex flex-col items-center border-2 bg-surface p-3 reveal ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`} style={{ animationDelay: `${i * 50}ms` }}>
              <Ring value={list.length ? d / list.length : 0} color={c.color} size={72} stroke={7} label={list.length ? `${d}/${list.length}` : "—"} />
              <div className="mt-2 text-center text-[11px] font-semibold uppercase">{c.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Momentum({ tasks, logs }: { tasks: Task[]; logs: import("@/lib/data").DailyLog[] }) {
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const p = subDays(d, 7);
    const count = (k: string) => tasks.filter((t) => t.done && t.due_date === k).length;
    return { label: format(d, "EEEEE"), value: count(dayKey(d)), prev: count(dayKey(p)) };
  });
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const cur = sum(data.map((d) => d.value)), prev = sum(data.map((d) => d.prev));
  const focus = (from: number, to: number) => sum(logs.filter((l) => { const n = differenceInCalendarDays(new Date(), parseISO(l.log_date)); return n >= from && n <= to; }).map((l) => l.focus_minutes));
  const fCur = focus(0, 6), fPrev = focus(7, 13);
  const delta = (a: number, b: number) => (b === 0 ? (a > 0 ? "new" : "±0") : `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%`);
  return (
    <section className="panel p-5">
      <h2 className="font-display text-2xl uppercase">Weekly momentum</h2>
      <div className="mt-2 flex gap-6 font-mono text-xs">
        <div><span className="text-2xl font-bold text-acid">{cur}</span> missions <span className="text-muted-foreground">vs {prev} ({delta(cur, prev)})</span></div>
        <div><span className="text-2xl font-bold text-cyan">{fCur}m</span> focus <span className="text-muted-foreground">vs {fPrev}m ({delta(fCur, fPrev)})</span></div>
      </div>
      <div className="mt-4"><Bars data={data} /></div>
      <p className="mt-2 text-[10px] uppercase text-muted-foreground">Solid = this week · dotted = same day last week</p>
    </section>
  );
}

function Timeline({ tasks, logs }: { tasks: Task[]; logs: import("@/lib/data").DailyLog[] }) {
  const items = [
    ...tasks.filter((t) => t.done && t.completed_at).map((t) => ({ at: t.completed_at!, kind: "Mission", text: t.title, color: "bg-acid" })),
    ...logs.filter((l) => l.highlight).map((l) => ({ at: l.updated_at, kind: "Highlight", text: l.highlight!, color: "bg-magenta" })),
    ...logs.filter((l) => l.workout_done).map((l) => ({ at: `${l.log_date}T18:00:00`, kind: "Workout", text: "Workout completed", color: "bg-orange" })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  return (
    <section className="panel p-5">
      <h2 className="mb-4 font-display text-2xl uppercase">Activity feed</h2>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Your story starts when you complete a mission or log a highlight.</p> : (
        <ol className="relative space-y-3 border-l-2 border-dashed pl-5">
          {items.map((it, i) => (
            <li key={i} className="relative">
              <span className={`absolute -left-[27px] top-1 size-3 ${it.color} ring-2 ring-ink`} />
              <div className="font-mono text-[10px] uppercase text-muted-foreground">{it.kind} · {format(new Date(it.at), "EEE dd MMM, HH:mm")}</div>
              <div className="text-sm">{it.text}</div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
