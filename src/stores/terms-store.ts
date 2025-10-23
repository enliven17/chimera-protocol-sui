import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

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

// Custom cookie storage implementation
const cookieStorage = {
  getItem: (name: string): string | null => {
    return Cookies.get(name) || null;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, {
      expires: 30, // Cookie expires in 30 days
      secure: true, // Only send over HTTPS
      sameSite: "strict", // CSRF protection
    });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};

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
        // Also set a separate cookie with longer expiration for region acknowledgment
        Cookies.set("chimeraai-region-acknowledged", "true", {
          expires: 30, // 30 days
          secure: true,
          sameSite: "strict",
        });
        Cookies.set("chimeraai-region-country", get().countryCode || "", {
          expires: 365,
          secure: true,
          sameSite: "strict",
        });
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
        // Clear region cookies
        Cookies.remove("chimeraai-region-acknowledged");
        Cookies.remove("chimeraai-region-country");
      },
    }),
    {
      name: "chimeraai-terms",
      storage: createJSONStorage(() => cookieStorage),
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
  const acknowledged = Cookies.get("chimeraai-region-acknowledged") === "true";
  const countryCode = Cookies.get("chimeraai-region-country");

  return { acknowledged, countryCode };
};