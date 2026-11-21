export function BoardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the board" className="flex flex-col gap-8 px-6 py-6">
      {[0, 1].map((g) => (
        <div key={g} className="flex flex-col gap-2">
          <div className="shimmer h-5 w-40 rounded-sm" />
          {[0, 1, 2].map((r) => (
            <div key={r} className="shimmer h-9 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="m-6 flex flex-col items-start gap-3 rounded-lg bg-error-bg p-4 text-sm text-error">
      <span>Couldn’t load this board. Check that the Studio SQL has been run in Supabase, then try again.</span>
      <button type="button" onClick={onRetry} className="h-8 cursor-pointer rounded-md bg-paper px-3 text-studio-text">Try again</button>
    </div>
  );
}
