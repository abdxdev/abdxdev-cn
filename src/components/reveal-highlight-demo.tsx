export function RevealHighlightDemo() {
  return (
    <div className="p-5 space-y-3">
      {/* top row: two stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-xs text-fd-muted-foreground">Total Users</p>
          <p className="text-xl font-semibold tabular-nums">12,483</p>
          <p className="text-xs text-green-500">↑ 8.2% this month</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-xs text-fd-muted-foreground">Uptime</p>
          <p className="text-xl font-semibold tabular-nums">99.9%</p>
          <p className="text-xs text-green-500">↑ all systems go</p>
        </div>
      </div>

      {/* activity list — border-b on rows = partial borders */}
      <div className="rounded-lg border px-4">
        {[
          { user: "kbd",   action: "merged pull request",   time: "2m ago",  dot: "bg-purple-400" },
          { user: "mei",   action: "deployed to production", time: "18m ago", dot: "bg-green-400"  },
          { user: "tariq", action: "opened an issue",        time: "1h ago",  dot: "bg-yellow-400" },
        ].map((row, i, arr) => (
          <div
            key={row.user}
            className={`flex items-center gap-3 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`}
          >
            <span className={`size-1.5 rounded-full shrink-0 ${row.dot}`} />
            <span className="text-xs font-medium">{row.user}</span>
            <span className="text-xs text-fd-muted-foreground flex-1">{row.action}</span>
            <span className="text-[10px] text-fd-muted-foreground/50">{row.time}</span>
          </div>
        ))}
      </div>

      {/* pill tags */}
      <div className="flex flex-wrap gap-2">
        {["react", "tailwind", "motion", "ui", "a11y"].map((tag) => (
          <span key={tag} className="rounded-full border px-3 py-0.5 text-xs text-fd-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}