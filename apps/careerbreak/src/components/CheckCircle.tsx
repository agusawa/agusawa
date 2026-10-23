'use client'

import { Check } from 'lucide-react'

/** Round 44px-target checkbox. Renders the tick with a short settle animation when it turns on. */
export default function CheckCircle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className="-m-2.5 p-2.5 shrink-0 rounded-full">
      <span className={`grid place-items-center size-6 rounded-full border-2 ${checked ? 'border-pine bg-pine text-sheet' : 'border-graphite/50 hover:border-pine'}`}>
        {checked && <Check key="on" size={15} strokeWidth={3} className="tick-in" />}
      </span>
    </button>
  )
}
