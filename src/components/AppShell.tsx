import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home, NotebookPen, GraduationCap, Briefcase, FlaskConical, FolderGit2, Trophy, Dumbbell,
  Sparkles, BarChart3, Music, Settings, Plus, Menu, ChevronsLeft, LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { QuickAddDialog } from "./QuickAdd";

type NavItem = { to: string; params?: { slug: string }; label: string; icon: typeof Home };
export const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/log", label: "Daily Log", icon: NotebookPen },
  { to: "/m/$slug", params: { slug: "college" }, label: "College", icon: GraduationCap },
  { to: "/m/$slug", params: { slug: "career" }, label: "Placements", icon: Briefcase },
  { to: "/m/$slug", params: { slug: "research" }, label: "Research Lab", icon: FlaskConical },
  { to: "/m/$slug", params: { slug: "projects" }, label: "Projects", icon: FolderGit2 },
  { to: "/m/$slug", params: { slug: "hackathons" }, label: "Hackathons", icon: Trophy },
  { to: "/m/$slug", params: { slug: "fitness" }, label: "Fitness", icon: Dumbbell },
  { to: "/m/$slug", params: { slug: "habits" }, label: "Side Quests", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/m/$slug", params: { slug: "music" }, label: "Music", icon: Music },
  { to: "/settings", label: "Settings", icon: Settings },
];

function hrefOf(n: NavItem) { return n.params ? n.to.replace("$slug", n.params.slug) : n.to; }

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [quick, setQuick] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) { e.preventDefault(); setQuick(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center font-display text-3xl glitch">LIFE.exe</div>;
  }

  const isActive = (n: NavItem) => (hrefOf(n) === "/" ? path === "/" : path.startsWith(hrefOf(n)));
  const NavLinks = ({ compact, onPick }: { compact?: boolean; onPick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const A = isActive(n);
        return (
          <Link key={n.label} to={n.to} params={n.params as never} onClick={onPick} title={n.label}
            className={`group relative flex items-center gap-3 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${A ? "bg-acid text-ink" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"}`}>
            <n.icon className="size-4 shrink-0" />
            {!compact && <span>{n.label}</span>}
            {A && !compact && <span className="ml-auto font-mono text-[10px]">●</span>}
          </Link>
        );
      })}
    </nav>
  );

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r-2 bg-sidebar p-3 md:flex ${collapsed ? "w-16" : "w-60"} transition-[width]`}>
        <div className="mb-6 flex items-center justify-between px-1">
          {!collapsed && <Link to="/" className="font-display text-2xl tracking-wide glitch">LIFE<span className="text-acid">.exe</span></Link>}
          <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" className="p-1 text-muted-foreground hover:text-cyan">
            <ChevronsLeft className={`size-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto"><NavLinks compact={collapsed} /></div>
        <button onClick={() => setQuick(true)} className={`btn-ink mt-3 ${collapsed ? "px-0" : ""}`} title="Quick add (N)">
          <Plus className="size-4" />{!collapsed && "Quick add"}
        </button>
        <button onClick={signOut} className="mt-2 flex items-center gap-2 px-3 py-2 text-xs uppercase text-muted-foreground hover:text-magenta">
          <LogOut className="size-4" />{!collapsed && "Sign out"}
        </button>
      </aside>

      <main className="min-w-0 flex-1 pb-28 md:pb-10">{children}</main>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 bg-sidebar md:hidden">
        <div className="grid grid-cols-5 items-end">
          {NAV.slice(0, 2).map((n) => (
            <Link key={n.label} to={n.to} className={`flex flex-col items-center gap-1 py-3 text-[10px] uppercase ${isActive(n) ? "text-acid" : "text-muted-foreground"}`}>
              <n.icon className="size-5" />{n.label.split(" ")[0]}
            </Link>
          ))}
          <div className="flex justify-center">
            <button onClick={() => setQuick(true)} aria-label="Quick add" className="btn-ink -mt-6 size-14 rotate-[-4deg] p-0"><Plus className="size-6" /></button>
          </div>
          <Link to="/analytics" className={`flex flex-col items-center gap-1 py-3 text-[10px] uppercase ${path.startsWith("/analytics") ? "text-acid" : "text-muted-foreground"}`}>
            <BarChart3 className="size-5" />Stats
          </Link>
          <button onClick={() => setDrawer(true)} className="flex flex-col items-center gap-1 py-3 text-[10px] uppercase text-muted-foreground">
            <Menu className="size-5" />More
          </button>
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-72 border-r-2 bg-sidebar p-4">
          <SheetTitle className="mb-4 font-display text-2xl">LIFE<span className="text-acid">.exe</span></SheetTitle>
          <NavLinks onPick={() => setDrawer(false)} />
          <button onClick={signOut} className="mt-6 flex items-center gap-2 px-3 py-2 text-xs uppercase text-muted-foreground hover:text-magenta">
            <LogOut className="size-4" />Sign out
          </button>
        </SheetContent>
      </Sheet>

      <QuickAddDialog open={quick} onOpenChange={setQuick} />
    </div>
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b-2 speed-lines px-5 pb-6 pt-8 md:px-10">
      <span className="sticker -rotate-2 bg-magenta text-foreground">{kicker}</span>
      <h1 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">{title}</h1>
      {children}
    </header>
  );
}
