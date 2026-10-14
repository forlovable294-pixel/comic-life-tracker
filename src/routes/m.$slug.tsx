import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Arrow } from "@/components/doodles";

const MODULES: Record<string, { title: string; phase: number; blurb: string; items: string[] }> = {
  college: { title: "College", phase: 2, blurb: "Courses, attendance, assignments and exam prep.", items: ["Course tracker", "Assignment deadlines", "Attendance", "GPA trend"] },
  career: { title: "Placements & Career", phase: 2, blurb: "DSA grind, applications and interview pipeline.", items: ["Problem counter", "Application pipeline", "Interview notes", "Skill tree"] },
  research: { title: "Research Lab", phase: 2, blurb: "Papers, experiments and reading lists.", items: ["Paper library", "Experiment log", "Writing progress"] },
  projects: { title: "Projects", phase: 2, blurb: "Builds, milestones and shipped work.", items: ["Project board", "Milestones", "Links & repos"] },
  hackathons: { title: "Hackathons", phase: 2, blurb: "Events, teams, submissions and wins.", items: ["Event calendar", "Submissions", "Results wall"] },
  fitness: { title: "Fitness & Health", phase: 2, blurb: "Gym sets, cardio sessions and daily activity.", items: ["Workout builder", "Sets & PRs", "Cardio log"] },
  habits: { title: "Habits & Side Quests", phase: 2, blurb: "Daily habits, streaks and life side quests.", items: ["Habit grid", "Streaks", "Quest log"] },
  music: { title: "Music", phase: 3, blurb: "A persistent dock for Spotify & YouTube embeds.", items: ["Saved embeds", "Focus playlists", "Bottom dock player"] },
};

export const Route = createFileRoute("/m/$slug")({
  loader: ({ params }) => { const m = MODULES[params.slug]; if (!m) throw notFound(); return m; },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Module"} — LIFE.exe` },
      { name: "description", content: loaderData?.blurb ?? "LIFE.exe module" },
      { property: "og:title", content: `${loaderData?.title ?? "Module"} — LIFE.exe` },
      { property: "og:description", content: loaderData?.blurb ?? "LIFE.exe module" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModulePage,
});

function ModulePage() {
  const m = Route.useLoaderData();
  return (
    <AppShell>
      <PageHeader kicker={`Phase ${m.phase} · locked`} title={m.title}>
        <p className="mt-2 text-muted-foreground">{m.blurb}</p>
      </PageHeader>
      <div className="px-5 py-8 md:px-10">
        <div className="panel panel-pop relative max-w-2xl overflow-hidden p-6">
          <div className="halftone pointer-events-none absolute inset-0 text-surface-2" />
          <div className="relative">
            <span className="sticker rotate-2 bg-orange text-ink">Under construction</span>
            <h2 className="mt-4 font-display text-2xl uppercase">This chapter isn't written yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Coming in Phase {m.phase}:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {m.items.map((i) => <li key={i} className="border-2 border-dashed px-3 py-2 text-sm">{i}</li>)}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Link to="/" className="btn-ink">Back to HQ</Link>
              <Arrow className="h-8 w-16 -scale-x-100" />
              <span className="text-xs text-muted-foreground">Meanwhile, tag missions with this area on the dashboard.</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
