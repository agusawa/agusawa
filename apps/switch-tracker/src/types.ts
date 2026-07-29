export type Status = "waiting" | "review" | "idle" | "done";

export interface Project {
  id: string;
  name: string;
  status: Status;
  lastAsked: string;
  expecting: string;
  watchFor: string;
  nextAction: string;
  updatedAt: number;
}
