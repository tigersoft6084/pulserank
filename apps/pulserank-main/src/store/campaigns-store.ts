import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "detailed" | "compact" | "summary";
export type SelectedTab =
  | "before-after-site"
  | "before-after-keyword"
  | "before-after-url"
  | "detail-site"
  | "detail-keyword"
  | "settings";

interface CampaignsState {
  viewMode: ViewMode;
  selectedTab: SelectedTab;
  setViewMode: (mode: ViewMode) => void;
  setSelectedTab: (tab: SelectedTab) => void;
}

export const useCampaignsStore = create<CampaignsState>()(
  persist(
    (set) => ({
      viewMode: "detailed",
      selectedTab: "before-after-site",
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),
    }),
    {
      name: "campaigns-storage",
    },
  ),
);
