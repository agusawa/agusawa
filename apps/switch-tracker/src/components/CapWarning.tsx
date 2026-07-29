interface CapWarningProps {
  show: boolean;
}

export function CapWarning({ show }: CapWarningProps) {
  if (!show) return null;

  return (
    <p className="px-1 text-xs text-stone-500">
      3+ active projects — consider dropping to 2 for a bit.
    </p>
  );
}
