import { useState } from "react";
import type { Project } from "../types";
import { STATUS_CONFIG, STATUS_ORDER } from "../statusConfig";

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: string, patch: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

const EDITABLE_FIELDS: { key: keyof Project; label: string }[] = [
  { key: "lastAsked", label: "Last asked" },
  { key: "expecting", label: "Expecting" },
  { key: "watchFor", label: "Watch for" },
  { key: "nextAction", label: "Next action" },
];

export function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_CONFIG[project.status];

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span aria-hidden="true">{meta.emoji}</span>
          <span className={`text-xs font-medium ${meta.text}`}>{meta.label}</span>
          <span className="truncate text-sm font-semibold text-stone-800">{project.name}</span>
        </button>

        <div className="flex items-center gap-1">
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              title={STATUS_CONFIG[status].label}
              onClick={() => onUpdate(project.id, { status })}
              className={`h-3.5 w-3.5 rounded-full ${STATUS_CONFIG[status].dot} ${
                project.status === status ? "ring-2 ring-offset-1 ring-stone-400" : "opacity-40"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onDelete(project.id)}
          className="text-xs text-stone-400 hover:text-red-500"
        >
          Delete
        </button>
      </div>

      {project.nextAction && (
        <p className="mt-1 truncate pl-6 text-xs text-stone-400">
          {project.nextAction}
        </p>
      )}

      {expanded && (
        <div className="mt-3 grid gap-2">
          {EDITABLE_FIELDS.map(({ key, label }) => (
            <EditableField
              key={key}
              label={label}
              value={project[key] as string}
              onCommit={(value) => {
                if (value === project[key]) return;
                onUpdate(project.id, { [key]: value } as Partial<Project>);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  onCommit: (value: string) => void;
}

function EditableField({ label, value, onCommit }: EditableFieldProps) {
  const [draft, setDraft] = useState(value);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft)}
        className="rounded-md border border-stone-300 px-2 py-1 text-sm text-stone-800 focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}
