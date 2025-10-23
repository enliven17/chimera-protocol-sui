"use client";

import { useTermsStore, checkPreviousRegionAcknowledgment } from "@/stores/terms-store";
import { getUserLocation, isRegionRestricted } from "@/lib/geolocation";
import { useEffect } from "react";
import { TermsModal } from "./terms-modal";
import { RegionRestrictionModal } from "./region-restriction-modal";

interface TermsGuardProps {
  children: React.ReactNode;
}

export function TermsGuard({ children }: TermsGuardProps) {
  const { 
    isLoadingRegion,
    setRegionRestricted, 
    setLoadingRegion, 
    setRegionError,
    acknowledgeRegion 
  } = useTermsStore();

  useEffect(() => {
    const checkRegionAndCookies = async () => {
      try {
        setLoadingRegion(true);
        
        // First, check if user has previously acknowledged their region
        const previousAcknowledgment = checkPreviousRegionAcknowledgment();
        
        if (previousAcknowledgment.acknowledged && previousAcknowledgment.countryCode) {
          // User has previously acknowledged, check if it's the same region
          const location = await getUserLocation();
          
          if (location.countryCode === previousAcknowledgment.countryCode) {
            // Same region as before, automatically acknowledge
            const restricted = isRegionRestricted(location.countryCode);
            setRegionRestricted(restricted, location.countryCode, location.country);
            acknowledgeRegion();
            setLoadingRegion(false);
            return;
          }
        }
        
        // Get fresh location data
        const location = await getUserLocation();
        
        if (location.error) {
          setRegionError(location.error);
          setRegionRestricted(false);
          return;
        }

        const restricted = isRegionRestricted(location.countryCode);
        setRegionRestricted(restricted, location.countryCode, location.country);
        
        if (restricted) {
          console.warn(`Access from restricted region: ${location.country} (${location.countryCode})`);
        }
        
        // If user has previously acknowledged this specific region, auto-acknowledge
        if (previousAcknowledgment.acknowledged && 
            previousAcknowledgment.countryCode === location.countryCode) {
          acknowledgeRegion();
        }
        
      } catch (error) {
        console.error('Region check failed:', error);
        setRegionError('Failed to verify region');
        setRegionRestricted(false);
      } finally {
        setLoadingRegion(false);
      }
    };

    checkRegionAndCookies();
  }, [setRegionRestricted, setLoadingRegion, setRegionError, acknowledgeRegion]);

  // Show loading state while checking region
  if (isLoadingRegion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#eab308] to-[#ca8a04] blur-md opacity-70"></div>
          <div className="absolute inset-0 rounded-full bg-[#0A0C14]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{
            backgroundImage: 'conic-gradient(from 0deg, #eab308, #ca8a04, #eab308)',
            WebkitMask: 'radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0)'
          }} />
          <div className="absolute inset-0 animate-spin" style={{animationDuration: '1200ms'}}>
            <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{
              backgroundImage: 'conic-gradient(from 90deg, transparent 0%, #eab308 30%, transparent 60%)',
              WebkitMask: 'radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0)'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <RegionRestrictionModal />
      <TermsModal />
    </>
  );
}