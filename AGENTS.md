<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- User data (tasks, daily_logs, profiles) is read/written from the browser via the generated Lovable Cloud client with RLS scoped to auth.uid(); hooks live in src/lib/data.ts — keeps one data layer.
- Signed-in pages wrap content in <AppShell>, which also guards auth and redirects to /auth — no pathless layout to avoid "/" conflicts.
- Unbuilt modules render through src/routes/m.$slug.tsx as honest "coming in Phase N" pages — never fake data.
- Visual primitives (panel, sticker, btn-ink, field, halftone) are @utility classes in src/styles.css; reuse them instead of ad hoc styles.
