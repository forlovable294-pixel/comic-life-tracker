import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Star, Scribble } from "@/components/doodles";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LIFE.exe" },
      { name: "description", content: "Boot up LIFE.exe, your personal life operating system." },
      { property: "og:title", content: "Sign in — LIFE.exe" },
      { property: "og:description", content: "Boot up LIFE.exe, your personal life operating system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) toast.success("Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally { setBusy(false); }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="grid min-h-screen place-items-center speed-lines px-4">
      <div className="relative w-full max-w-md">
        <Star className="absolute -right-4 -top-6 size-12 rotate-12" color="var(--magenta)" />
        <h1 className="font-display text-6xl uppercase glitch">LIFE<span className="text-acid">.exe</span></h1>
        <Scribble className="h-4 w-48" color="var(--cyan)" />
        <p className="mt-2 text-muted-foreground">Your life. Your stats. Your side quests.</p>
        <div className="panel panel-pop mt-6 p-6">
          <div className="mb-4 grid grid-cols-2">
            {(["in", "up"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`border-b-2 py-2 font-mono text-xs uppercase ${mode === m ? "border-acid text-acid" : "text-muted-foreground"}`}>
                {m === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input className="field" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="field" type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn-ink w-full" disabled={busy}>{busy ? "Booting…" : mode === "in" ? "Boot up" : "Create player"}</button>
          </form>
          <div className="my-4 flex items-center gap-3 text-[10px] uppercase text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <button onClick={google} className="btn-ghost-ink w-full">Continue with Google</button>
        </div>
      </div>
    </div>
  );
}
