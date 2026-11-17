export function ScreenSkeleton({ title }: { title: string }) {
  return (
    <div aria-busy="true">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">
          {title}
        </h1>
        <div className="h-11 w-[13.5rem] rounded-[4px] border border-rule bg-surface" />
      </header>
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-[2px] bg-rule/60" />
          <div className="h-10 w-56 max-w-full rounded-[2px] bg-rule/60" />
          <div className="h-4 w-64 max-w-full rounded-[2px] bg-rule/40" />
        </div>
        <div className="space-y-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-14 border-b border-rule/70"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <p className="sr-only">Loading data from this device.</p>
    </div>
  );
}
