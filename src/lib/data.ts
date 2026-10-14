import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "./auth";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];
export type DailyLogInsert = Database["public"]["Tables"]["daily_logs"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const dayKey = (d: Date = new Date()) => format(d, "yyyy-MM-dd");

export const CATEGORIES = [
  { id: "academics", label: "Academics", color: "var(--cyan)" },
  { id: "placement", label: "Placement prep", color: "var(--acid)" },
  { id: "research", label: "Research", color: "var(--magenta)" },
  { id: "projects", label: "Projects", color: "var(--orange)" },
  { id: "hackathons", label: "Hackathons", color: "var(--cyan)" },
  { id: "fitness", label: "Fitness", color: "var(--acid)" },
  { id: "habits", label: "Habits", color: "var(--magenta)" },
  { id: "fun", label: "Fun", color: "var(--orange)" },
  { id: "personal", label: "Personal", color: "var(--muted-foreground)" },
] as const;
export const catMeta = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[8];

const err = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something broke. Try again.");

/** Tasks within an inclusive date range (default: last 14 days → today). */
export function useTasks(from = dayKey(subDays(new Date(), 13)), to = dayKey()) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["tasks", user?.id, from, to],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks").select("*").gte("due_date", from).lte("due_date", to)
        .order("done").order("priority").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useLogs(from = dayKey(subDays(new Date(), 13)), to = dayKey()) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["logs", user?.id, from, to],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs").select("*").gte("log_date", from).lte("log_date", to).order("log_date");
      if (error) throw error;
      return data;
    },
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, "display_name" | "status">>) => {
      const { error } = await supabase.from("profiles").upsert({ id: user!.id, ...patch, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
    onError: err,
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (t: Omit<TaskInsert, "user_id">) => {
      const { error } = await supabase.from("tasks").insert({ ...t, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); toast.success("Mission added"); },
    onError: err,
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Task> & { id: string }) => {
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: err,
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: err,
  });
}

export function useSaveLog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (l: Omit<DailyLogInsert, "user_id">) => {
      const { error } = await supabase.from("daily_logs")
        .upsert({ ...l, user_id: user!.id, updated_at: new Date().toISOString() }, { onConflict: "user_id,log_date" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["logs"] }); toast.success("Log saved"); },
    onError: err,
  });
}

/** How many of the core daily fields were filled — transparent "day logged" meter. */
export function logCoverage(l?: DailyLog | null) {
  if (!l) return 0;
  const checks = [l.mood != null, l.energy != null, l.focus_minutes > 0, l.steps > 0, l.sleep_hours != null, !!l.highlight, !!l.journal];
  return checks.filter(Boolean).length / checks.length;
}
