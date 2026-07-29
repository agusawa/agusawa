interface FocusBannerProps {
  message: string | null;
}

export function FocusBanner({ message }: FocusBannerProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300">
      {message}
    </div>
  );
}
