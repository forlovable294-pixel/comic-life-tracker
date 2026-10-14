import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useProfile, useUpdateProfile } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Integrations — LIFE.exe" },
      { name: "description", content: "Profile, preferences and the honest status of health and music integrations." },
      { property: "og:title", content: "Settings & Integrations — LIFE.exe" },
      { property: "og:description", content: "Profile, preferences and the honest status of health and music integrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell><SettingsPage /></AppShell>,
});

const INTEGRATIONS = [
  { name: "Apple Health (HealthKit)", note: "Needs a native iOS app layer. A web page can't read HealthKit. Planned for Phase 4." },
  { name: "Google Health Connect", note: "Needs a native Android app layer. Planned for Phase 4." },
  { name: "Spotify / YouTube embeds", note: "Coming with the Music section in Phase 3." },
];

function SettingsPage() {
  const { user } = useAuth();
  const profile = useProfile();
  const upd = useUpdateProfile();
  const [name, setName] = useState("");
  useEffect(() => setName(profile.data?.display_name ?? ""), [profile.data]);
  return (
    <>
      <PageHeader kicker="System" title="Settings" />
      <div className="grid gap-6 px-5 py-8 md:px-10 lg:grid-cols-2">
        <section className="panel space-y-3 p-5">
          <h2 className="font-display text-xl uppercase">Player profile</h2>
          <div className="text-xs text-muted-foreground">Signed in as {user?.email}</div>
          <label className="block space-y-1 text-xs uppercase text-muted-foreground">Display name
            <input className="field" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button className="btn-ink" disabled={upd.isPending} onClick={() => upd.mutate({ display_name: name.trim().slice(0, 60) || null })}>Save</button>
        </section>
        <section className="panel p-5">
          <h2 className="mb-3 font-display text-xl uppercase">Integrations</h2>
          <ul className="space-y-3">
            {INTEGRATIONS.map((i) => (
              <li key={i.name} className="border-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{i.name}</span>
                  <span className="sticker bg-surface-2 text-muted-foreground">Not connected</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
