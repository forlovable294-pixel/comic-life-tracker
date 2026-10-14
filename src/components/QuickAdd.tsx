import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, dayKey, useAddTask } from "@/lib/data";

export function QuickAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const add = useAddTask();
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState<"must" | "should" | "side">("must");
  const [category, setCategory] = useState("personal");
  const [priority, setPriority] = useState(2);
  const [due, setDue] = useState(dayKey());
  const [estimate, setEstimate] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await add.mutateAsync({
      title: t.slice(0, 200), bucket, category, priority, due_date: due,
      estimate_minutes: estimate ? Math.min(1440, Math.max(0, parseInt(estimate))) : null,
      notes: notes.trim() ? notes.trim().slice(0, 2000) : null,
    });
    setTitle(""); setNotes(""); setEstimate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel rounded-none border-2 bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-wide">New mission</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input autoFocus className="field text-base" placeholder="What needs doing?" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            {(["must", "should", "side"] as const).map((b) => (
              <button type="button" key={b} onClick={() => setBucket(b)}
                className={`border-2 py-2 font-mono text-xs uppercase ${bucket === b ? "border-acid bg-acid text-ink" : "border-border text-muted-foreground"}`}>
                {b === "side" ? "Side quest" : `${b} do`}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-muted-foreground">Category
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">Priority
              <select className="field" value={priority} onChange={(e) => setPriority(+e.target.value)}>
                <option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option>
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">Deadline
              <input type="date" className="field" value={due} onChange={(e) => setDue(e.target.value)} required />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">Est. minutes
              <input type="number" min={0} max={1440} className="field" value={estimate} onChange={(e) => setEstimate(e.target.value)} />
            </label>
          </div>
          <textarea className="field min-h-20" placeholder="Notes (optional)" maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="btn-ink w-full" disabled={add.isPending || !title.trim()}>{add.isPending ? "Adding…" : "Add mission"}</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
