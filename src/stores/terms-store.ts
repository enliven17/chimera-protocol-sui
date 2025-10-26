import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TermsState {
  // Existing terms state
  showTermsModal: boolean;
  hasAcceptedTerms: boolean;
  acceptTerms: () => void;
  declineTerms: () => void;

  // New region state
  isRegionRestricted: boolean;
  countryCode?: string;
  country?: string;
  hasAcknowledgedRegion: boolean;
  isLoadingRegion: boolean;
  regionError?: string;
  setRegionRestricted: (restricted: boolean, countryCode?: string, country?: string) => void;
  acknowledgeRegion: () => void;
  setLoadingRegion: (loading: boolean) => void;
  setRegionError: (error?: string) => void;
  resetRegion: () => void;
}

export const useTermsStore = create<TermsState>()(
  persist(
    (set, get) => ({
      // Existing terms state
      showTermsModal: true,
      hasAcceptedTerms: false,
      acceptTerms: () => set({ hasAcceptedTerms: true, showTermsModal: false }),
      declineTerms: () => {
        // Redirect to alternative site or show info page
        window.location.href = "https://www.google.com";
      },

      // New region state
      isRegionRestricted: false,
      hasAcknowledgedRegion: false,
      isLoadingRegion: true,
      setRegionRestricted: (restricted, countryCode, country) => {
        set({
          isRegionRestricted: restricted,
          countryCode,
          country,
          hasAcknowledgedRegion: false,
        });
      },
      acknowledgeRegion: () => {
        set({ hasAcknowledgedRegion: true });
        // Store in localStorage as well
        if (typeof window !== 'undefined') {
          localStorage.setItem("suimeraai-region-acknowledged", "true");
          localStorage.setItem("suimeraai-region-country", get().countryCode || "");
        }
      },
      setLoadingRegion: (loading) => set({ isLoadingRegion: loading }),
      setRegionError: (error) => set({ regionError: error, isLoadingRegion: false }),
      resetRegion: () => {
        set({
          isRegionRestricted: false,
          hasAcknowledgedRegion: false,
          isLoadingRegion: true,
          regionError: undefined,
          countryCode: undefined,
          country: undefined,
        });
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem("suimeraai-region-acknowledged");
          localStorage.removeItem("suimeraai-region-country");
        }
      },
    }),
    {
      name: "suimeraai-terms",
      partialize: (state) => ({
        hasAcceptedTerms: state.hasAcceptedTerms,
        hasAcknowledgedRegion: state.hasAcknowledgedRegion,
        countryCode: state.countryCode,
        isRegionRestricted: state.isRegionRestricted,
      }),
    },
  ),
);

// Helper function to check if region was previously acknowledged
export const checkPreviousRegionAcknowledgment = (): { acknowledged: boolean; countryCode?: string } => {
  if (typeof window === 'undefined') {
    return { acknowledged: false };
  }

  const acknowledged = localStorage.getItem("suimeraai-region-acknowledged") === "true";
  const countryCode = localStorage.getItem("suimeraai-region-country") || undefined;

  return { acknowledged, countryCode };
};