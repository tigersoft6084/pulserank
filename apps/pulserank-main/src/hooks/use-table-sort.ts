import { useState, useMemo } from "react";
import {
  SortConfig,
  // SortDirection,
  sortData,
  getNextSortDirection,
} from "@/lib/utils/sort-utils";
import type { SortableData } from "@/lib/utils/sort-utils";

export function useTableSort<T extends SortableData>(initialData: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const sortedData = useMemo(() => {
    return sortData(initialData || [], sortConfig);
  }, [initialData, sortConfig]);

  const handleSort = (key: string) => {
    const newDirection = getNextSortDirection(
      sortConfig?.key || "",
      sortConfig?.direction || null,
      key,
    );

    setSortConfig({
      key,
      direction: newDirection,
    });
  };

  const clearSort = () => {
    setSortConfig(null);
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
    clearSort,
  };
}
