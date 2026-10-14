import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { dayKey, logCoverage, useLogs, useSaveLog } from "@/lib/data";
import { Ring } from "@/components/charts";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Daily Log — LIFE.exe" },
      { name: "description", content: "Log mood, energy, focus, steps, workouts and a journal entry for each day." },
      { property: "og:title", content: "Daily Log — LIFE.exe" },
      { property: "og:description", content: "Log mood, energy, focus, steps, workouts and a journal entry for each day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell><LogPage /></AppShell>,
});

const empty = { mood: null as number | null, energy: null as number | null, focus_minutes: 0, learning_minutes: 0, steps: 0, cardio_minutes: 0, sleep_hours: null as number | null, workout_done: false, highlight: "", journal: "" };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

function LogPage() {
  const [date, setDate] = useState(dayKey());
  const logs = useLogs(dayKey(subDays(new Date(), 30)), dayKey());
  const save = useSaveLog();
  const existing = logs.data?.find((l) => l.log_date === date);
  const [f, setF] = useState(empty);

  useEffect(() => {
    setF(existing ? {
      mood: existing.mood, energy: existing.energy, focus_minutes: existing.focus_minutes, learning_minutes: existing.learning_minutes,
      steps: existing.steps, cardio_minutes: existing.cardio_minutes, sleep_hours: existing.sleep_hours, workout_done: existing.workout_done,
      highlight: existing.highlight ?? "", journal: existing.journal ?? "",
    } : empty);
  }, [existing, date]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate({
      log_date: date, mood: f.mood, energy: f.energy,
      focus_minutes: clamp(f.focus_minutes, 0, 1440), learning_minutes: clamp(f.learning_minutes, 0, 1440),
      steps: clamp(f.steps, 0, 200000), cardio_minutes: clamp(f.cardio_minutes, 0, 1440),
      sleep_hours: f.sleep_hours == null ? null : clamp(f.sleep_hours, 0, 24), workout_done: f.workout_done,
      highlight: f.highlight.trim().slice(0, 500) || null, journal: f.journal.trim().slice(0, 10000) || null,
    });
  };

  const isToday = date === dayKey();
  const num = (k: "focus_minutes" | "learning_minutes" | "steps" | "cardio_minutes", label: string, max: number) => (
    <label className="space-y-1 text-xs uppercase text-muted-foreground">{label}
      <input type="number" min={0} max={max} className="field font-mono" value={f[k]} onChange={(e) => setF({ ...f, [k]: parseInt(e.target.value) || 0 })} />
    </label>
  );
  const scale = (k: "mood" | "energy", label: string, faces: string[]) => (
    <div>
      <div className="mb-1 text-xs uppercase text-muted-foreground">{label}</div>
      <div className="flex gap-1">
        {faces.map((face, i) => (
          <button type="button" key={i} onClick={() => setF({ ...f, [k]: f[k] === i + 1 ? null : i + 1 })}
            className={`size-11 border-2 text-lg transition ${f[k] === i + 1 ? "-rotate-3 border-acid bg-acid text-ink" : "hover:border-cyan"}`}>{face}</button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader kicker="Chapter log" title="Daily Log">
        <div className="mt-4 flex items-center gap-2">
          <button aria-label="Previous day" className="btn-ghost-ink p-2" onClick={() => setDate(dayKey(subDays(parseISO(date), 1)))}><ChevronLeft className="size-4" /></button>
          <input type="date" className="field w-auto font-mono" value={date} max={dayKey()} onChange={(e) => e.target.value && setDate(e.target.value)} />
          <button aria-label="Next day" className="btn-ghost-ink p-2" disabled={isToday} onClick={() => setDate(dayKey(addDays(parseISO(date), 1)))}><ChevronRight className="size-4" /></button>
          <span className="ml-2 font-mono text-sm text-acid">{format(parseISO(date), "EEEE")}{isToday && " · today"}</span>
        </div>
      </PageHeader>

      <form onSubmit={submit} className="grid gap-6 px-5 py-8 md:px-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <section className="panel space-y-5 p-5">
            <h2 className="font-display text-xl uppercase">Vibe check</h2>
            <div className="flex flex-wrap gap-6">
              {scale("mood", "Mood", ["😵", "😕", "😐", "🙂", "🔥"])}
              {scale("energy", "Energy", ["1", "2", "3", "4", "5"])}
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="mb-4 font-display text-xl uppercase">Numbers</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {num("focus_minutes", "Focus min", 1440)}
              {num("learning_minutes", "Learning min", 1440)}
              {num("steps", "Steps", 200000)}
              {num("cardio_minutes", "Cardio min", 1440)}
              <label className="space-y-1 text-xs uppercase text-muted-foreground">Sleep hrs
                <input type="number" step="0.5" min={0} max={24} className="field font-mono" value={f.sleep_hours ?? ""} onChange={(e) => setF({ ...f, sleep_hours: e.target.value === "" ? null : parseFloat(e.target.value) })} />
              </label>
              <label className="flex items-center gap-3 self-end border-2 p-2.5 text-sm">
                <input type="checkbox" className="size-4 accent-[var(--acid)]" checked={f.workout_done} onChange={(e) => setF({ ...f, workout_done: e.target.checked })} />
                Worked out
              </label>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Steps are entered manually. Automatic health sync isn't connected — see Settings.</p>
          </section>
          <section className="panel space-y-3 p-5">
            <h2 className="font-display text-xl uppercase">Story</h2>
            <input className="field" maxLength={500} placeholder="Highlight of the day" value={f.highlight} onChange={(e) => setF({ ...f, highlight: e.target.value })} />
            <textarea className="field min-h-40" maxLength={10000} placeholder="Journal — what happened, what you learned, what's next…" value={f.journal} onChange={(e) => setF({ ...f, journal: e.target.value })} />
          </section>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="panel panel-pop flex flex-col items-center p-5">
            <Ring value={logCoverage(existing)} size={120} stroke={10} color="var(--magenta)" sub="logged" />
            <p className="mt-3 text-center text-xs text-muted-foreground">Share of mood, energy, focus, steps, sleep, highlight and journal filled in (saved).</p>
          </div>
          <button className="btn-ink w-full" disabled={save.isPending}>{save.isPending ? "Saving…" : existing ? "Update log" : "Save log"}</button>
        </aside>
      </form>
    </>
  );
}
