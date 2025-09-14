import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewUrlState {
  // URL state
  url: string;
  submittedUrl: string;

  // Settings for backlinks page
  maxUrlsPerDomain: string;

  // Actions
  setUrl: (url: string) => void;
  setSubmittedUrl: (url: string) => void;
  setMaxUrlsPerDomain: (value: string) => void;
  reset: () => void;
}

const initialState = {
  url: "",
  submittedUrl: "",
  maxUrlsPerDomain: "1",
};

export const useViewUrlStore = create<ViewUrlState>()(
  persist(
    (set) => ({
      ...initialState,

      setUrl: (url: string) => set({ url }),

      setSubmittedUrl: (submittedUrl: string) => set({ submittedUrl }),

      setMaxUrlsPerDomain: (maxUrlsPerDomain: string) =>
        set({ maxUrlsPerDomain }),

      reset: () => set(initialState),
    }),
    {
      name: "view-url-storage",
    }
  )
);
