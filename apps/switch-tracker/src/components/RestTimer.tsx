import { useEffect, useState } from "react";

const REST_SECONDS = 5 * 60;

interface RestTimerProps {
  onDone: () => void;
}

export function RestTimer({ onDone }: RestTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      setRemaining(null);
      onDone();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => (r ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onDone]);

  if (remaining !== null) {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return (
      <span className="text-sm text-stone-500 dark:text-stone-400">
        Stepping away — {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRemaining(REST_SECONDS)}
      className="text-sm text-stone-500 underline decoration-dotted hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
    >
      Step away — 5 min
    </button>
  );
}
