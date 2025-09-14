import { useState, useCallback } from "react";

export function useGoogleIndexFilter() {
  const [googleIndexFilter, setGoogleIndexFilter] = useState<string | null>(
    null,
  );
  const [googleIndexStatuses, setGoogleIndexStatuses] = useState<
    Record<string, "indexed" | "not-indexed" | "unknown" | "loading">
  >({});

  const handleGoogleIndexStatusChange = useCallback(
    (
      url: string,
      status: "indexed" | "not-indexed" | "unknown" | "loading",
    ) => {
      setGoogleIndexStatuses((prev) => ({
        ...prev,
        [url]: status,
      }));
    },
    [],
  );

  const handleGoogleIndexClick = useCallback(
    (url: string) => {
      const actualStatus = googleIndexStatuses[url];
      // Only allow filtering if we have a valid status (not loading or unknown)
      if (
        actualStatus &&
        actualStatus !== "loading" &&
        actualStatus !== "unknown"
      ) {
        setGoogleIndexFilter(
          googleIndexFilter === actualStatus ? null : actualStatus,
        );
      }
    },
    [googleIndexStatuses, googleIndexFilter],
  );

  const resetGoogleIndexFilter = useCallback(() => {
    setGoogleIndexFilter(null);
  }, []);

  const filterByGoogleIndex = useCallback(
    (data: Record<string, unknown>[]) => {
      return data.filter((backlink) => {
        const typedBacklink = backlink as { SourceURL: string };

        // Google Index filter - use actual status from API
        if (googleIndexFilter) {
          const actualStatus = googleIndexStatuses[typedBacklink.SourceURL];
          // Only filter if we have the actual status, otherwise show the row
          if (
            actualStatus &&
            actualStatus !== "loading" &&
            actualStatus !== googleIndexFilter
          ) {
            return false;
          }
        }

        return true;
      });
    },
    [googleIndexFilter, googleIndexStatuses],
  );

  return {
    // State
    googleIndexFilter,
    googleIndexStatuses,

    // Actions
    handleGoogleIndexStatusChange,
    handleGoogleIndexClick,
    resetGoogleIndexFilter,
    filterByGoogleIndex,
  };
}
