import { useGoogleIndexFilter } from "./use-google-index-filter";
import { useFlagFilter } from "./use-flag-filter";

export function useBacklinksFiltering() {
  const googleIndexFilterHook = useGoogleIndexFilter();
  const flagFilterHook = useFlagFilter();

  const filterData = (data: Record<string, unknown>[]) => {
    // Apply Google Index filter first
    let filteredData = googleIndexFilterHook.filterByGoogleIndex(data);

    // Then apply Flag filter
    filteredData = flagFilterHook.filterByFlags(filteredData);

    return filteredData;
  };

  return {
    // State from Google Index filter
    googleIndexFilter: googleIndexFilterHook.googleIndexFilter,
    googleIndexStatuses: googleIndexFilterHook.googleIndexStatuses,

    // State from Flag filter
    flagFilters: flagFilterHook.flagFilters,

    // Actions from Google Index filter
    handleGoogleIndexStatusChange:
      googleIndexFilterHook.handleGoogleIndexStatusChange,
    handleGoogleIndexClick: googleIndexFilterHook.handleGoogleIndexClick,
    resetGoogleIndexFilter: googleIndexFilterHook.resetGoogleIndexFilter,

    // Actions from Flag filter
    handleFlagClick: flagFilterHook.handleFlagClick,
    resetFlagFilters: flagFilterHook.resetFlagFilters,

    // Combined filtering
    filterData,
  };
}
