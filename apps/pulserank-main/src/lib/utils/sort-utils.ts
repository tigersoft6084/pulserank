export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export type SortableData = Record<string, unknown>;

export function sortData<T extends SortableData>(
  data: T[],
  sortConfig: SortConfig | null,
): T[] {
  if (!sortConfig) return data;

  const { key, direction } = sortConfig;

  return [...data].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === "asc" ? -1 : 1;
    if (bValue == null) return direction === "asc" ? 1 : -1;

    // Handle different data types
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue);
      return direction === "asc" ? comparison : -comparison;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Handle date strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return direction === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }
    }

    // Default string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return direction === "asc" ? comparison : -comparison;
  });
}

export function getNextSortDirection(
  currentKey: string,
  currentDirection: SortDirection | null,
  newKey: string,
): SortDirection {
  if (currentKey !== newKey) return "asc";
  if (currentDirection === "asc") return "desc";
  if (currentDirection === "desc") return "asc";
  return "asc";
}

export function getSortIcon(
  currentKey: string,
  sortKey: string,
  direction: SortDirection | null,
): "asc" | "desc" | null {
  if (currentKey !== sortKey) return null;
  return direction;
}
