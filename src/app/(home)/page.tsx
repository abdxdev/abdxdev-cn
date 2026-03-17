import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          abdxdev/cn
        </h1>
        <p className="text-lg text-fd-muted-foreground">
          A collection of beautifully crafted React components built with the
          shadcn/ui registry. Copy and paste into your apps. Open source.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-md bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground shadow-sm transition-colors hover:bg-fd-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/docs/components/reveal-highlight"
            className="inline-flex h-10 items-center justify-center rounded-md border border-fd-border bg-fd-background px-6 text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            Browse Components
          </Link>
        </div>
      </div>

      <div className="mt-20 grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        <div className="space-y-2 rounded-lg border border-fd-border p-6 text-left">
          <h3 className="font-semibold">Copy & Paste</h3>
          <p className="text-sm text-fd-muted-foreground">
            Install components directly into your project via the shadcn CLI.
            You own the code.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border border-fd-border p-6 text-left">
          <h3 className="font-semibold">TypeScript & JavaScript</h3>
          <p className="text-sm text-fd-muted-foreground">
            Every component ships with both TypeScript and JavaScript variants
            so you can choose.
          </p>
        </div>
        <div className="space-y-2 rounded-lg border border-fd-border p-6 text-left">
          <h3 className="font-semibold">Open Source</h3>
          <p className="text-sm text-fd-muted-foreground">
            Free to use in personal and commercial projects. MIT licensed.
          </p>
        </div>
      </div>
    </main>
  );
}
