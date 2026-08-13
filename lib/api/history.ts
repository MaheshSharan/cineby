import type { HistoryEntry } from "@/lib/db/types";

interface HistoryListResponse {
  items: HistoryEntry[];
}

export async function listHistory(): Promise<HistoryEntry[]> {
  const response = await fetch("/api/history");

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as HistoryListResponse;

  return Array.isArray(data.items) ? data.items : [];
}

export async function removeFromHistory(id: number): Promise<boolean> {
  const response = await fetch(`/api/history?id=${id}`, {
    method: "DELETE",
  });

  return response.ok;
}

export async function clearAllHistory(): Promise<boolean> {
  const response = await fetch("/api/history", {
    method: "DELETE",
  });

  return response.ok;
}