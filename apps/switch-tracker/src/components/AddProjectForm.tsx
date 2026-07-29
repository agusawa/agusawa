import { useState, type FormEvent } from "react";

interface AddProjectFormProps {
  onAdd: (name: string) => void;
}

export function AddProjectForm({ onAdd }: AddProjectFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New project name"
        className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
      >
        Add
      </button>
    </form>
  );
}
