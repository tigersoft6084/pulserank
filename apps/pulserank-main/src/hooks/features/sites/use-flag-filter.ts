import { useState, useCallback } from "react";
import { BacklinkFlags } from "@/types/backlinks";

export function useFlagFilter() {
  const [flagFilters, setFlagFilters] = useState<Set<number>>(new Set());

  const handleFlagClick = useCallback(
    (flagIndex: number) => {
      const newFlagFilters = new Set(flagFilters);

      if (newFlagFilters.has(flagIndex)) {
        newFlagFilters.delete(flagIndex);
      } else {
        newFlagFilters.add(flagIndex);
      }

      setFlagFilters(newFlagFilters);
    },
    [flagFilters],
  );

  const resetFlagFilters = useCallback(() => {
    setFlagFilters(new Set());
  }, []);

  const filterByFlags = useCallback(
    (data: Record<string, unknown>[]) => {
      if (!data || !Array.isArray(data)) {
        return [];
      }
      return data.filter((backlink) => {
        const typedBacklink = backlink as {
          Flags: BacklinkFlags;
        };

        // Multiple Flag filters - show rows that have ALL selected flags
        if (flagFilters.size > 0 && typedBacklink.Flags) {
          const flagKeys = [
            "doFollow",
            "redirect",
            "frame",
            "noFollow",
            "images",
            "deleted",
            "altText",
            "mention",
          ];
          const hasAllActiveFlags = Array.from(flagFilters).every(
            (flagIndex) => {
              const flagKey = flagKeys[flagIndex];
              return (
                flagKey &&
                typedBacklink.Flags[flagKey as keyof typeof typedBacklink.Flags]
              );
            },
          );
          if (!hasAllActiveFlags) return false;
        }

        return true;
      });
    },
    [flagFilters],
  );

  return {
    // State
    flagFilters,

    // Actions
    handleFlagClick,
    resetFlagFilters,
    filterByFlags,
  };
}
