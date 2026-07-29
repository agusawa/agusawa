import { useEffect, useMemo, useState } from "react";
import type { Project } from "./types";
import { loadProjects, saveProjects } from "./storage";
import { STATUS_RANK } from "./statusConfig";
import { getBannerMessage, isOverCap } from "./focusLogic";
import { AddProjectForm } from "./components/AddProjectForm";
import { ProjectCard } from "./components/ProjectCard";
import { FocusBanner } from "./components/FocusBanner";
import { CapWarning } from "./components/CapWarning";

export function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]),
    [projects]
  );

  const bannerMessage = useMemo(() => getBannerMessage(projects), [projects]);
  const overCap = useMemo(() => isOverCap(projects), [projects]);

  function handleAdd(name: string) {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      status: "idle",
      lastAsked: "",
      expecting: "",
      watchFor: "",
      nextAction: "",
      updatedAt: Date.now(),
    };
    setProjects((prev) => [...prev, project]);
  }

  function handleUpdate(id: string, patch: Partial<Project>) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p))
    );
  }

  function handleDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-lg font-semibold text-stone-800">Project Switch Tracker</h1>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 px-4 py-10 text-center">
          <p className="mb-4 text-sm text-stone-500">No projects yet — add one to start tracking.</p>
          <AddProjectForm onAdd={handleAdd} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <FocusBanner message={bannerMessage} />
          <CapWarning show={overCap} />
          <AddProjectForm onAdd={handleAdd} />
          <div className="flex flex-col gap-3">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
