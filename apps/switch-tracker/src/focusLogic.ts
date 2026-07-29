import type { Project } from "./types";

export function getBannerMessage(projects: Project[]): string | null {
  if (projects.length === 0) return null;

  const reviewCount = projects.filter((p) => p.status === "review").length;
  if (reviewCount > 0) {
    return `You have ${reviewCount} project${reviewCount === 1 ? "" : "s"} ready to review — batch these together.`;
  }

  const active = projects.filter((p) => p.status !== "done");
  if (active.length > 0 && active.every((p) => p.status === "waiting")) {
    return "Everything's waiting on AI. Take a 5-minute break before you check back.";
  }

  const waitingCount = projects.filter((p) => p.status === "waiting").length;
  if (waitingCount === 0 && reviewCount === 0) {
    return "Nothing pending — good time to fire off next tasks.";
  }

  return null;
}

export function isOverCap(projects: Project[]): boolean {
  const activeCount = projects.filter(
    (p) => p.status === "waiting" || p.status === "review"
  ).length;
  return activeCount > 2;
}
