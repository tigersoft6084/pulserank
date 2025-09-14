import React from "react";
import { useGoogleIndex } from "@/hooks/features/sites/use-google-index";
import { useLanguageStore } from "@/store/language-store";

interface GoogleIndexStatusTrackerProps {
  url: string;
  onStatusChange: (
    url: string,
    status: "indexed" | "not-indexed" | "unknown" | "loading",
  ) => void;
}

export function GoogleIndexStatusTracker({
  url,
  onStatusChange,
}: GoogleIndexStatusTrackerProps) {
  const { currentBase } = useLanguageStore();
  const {
    data: googleIndexInfo,
    isLoading,
    error,
  } = useGoogleIndex(url, currentBase);

  React.useEffect(() => {
    if (isLoading) {
      onStatusChange(url, "loading");
    } else if (error || !googleIndexInfo) {
      onStatusChange(url, "unknown");
    } else {
      if (googleIndexInfo.googleIndexed) {
        onStatusChange(url, "indexed");
      } else {
        onStatusChange(url, "not-indexed");
      }
    }
  }, [url, googleIndexInfo, isLoading, error, onStatusChange]);

  return null; // This component doesn't render anything
}
