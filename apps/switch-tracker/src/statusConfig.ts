import type { Status } from "./types";

export interface StatusMeta {
  label: string;
  emoji: string;
  dot: string;
  text: string;
}

export const STATUS_CONFIG: Record<Status, StatusMeta> = {
  waiting: { label: "Waiting on AI", emoji: "🟡", dot: "bg-amber-500", text: "text-amber-600" },
  review: { label: "Needs my review", emoji: "🔵", dot: "bg-blue-500", text: "text-blue-600" },
  idle: { label: "Idle", emoji: "⚪", dot: "bg-stone-400", text: "text-stone-500" },
  done: { label: "Done for now", emoji: "🟢", dot: "bg-emerald-500", text: "text-emerald-600" },
};

export const STATUS_ORDER: Status[] = ["review", "waiting", "idle", "done"];

export const STATUS_RANK: Record<Status, number> = STATUS_ORDER.reduce(
  (acc, status, index) => {
    acc[status] = index;
    return acc;
  },
  {} as Record<Status, number>
);
