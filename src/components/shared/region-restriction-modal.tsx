"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRestrictionMessage } from "@/lib/geolocation";
import { useTermsStore } from "@/stores/terms-store";
import { AlertTriangle, Globe, ExternalLink } from "lucide-react";
import { useState } from "react";

export function RegionRestrictionModal() {
  const { 
    isRegionRestricted, 
    countryCode, 
    country, 
    hasAcknowledgedRegion, 
    acknowledgeRegion 
  } = useTermsStore();
  
  const [hasAgreed, setHasAgreed] = useState(false);

  const shouldShowModal = isRegionRestricted && !hasAcknowledgedRegion;

  const handleContinue = () => {
    if (hasAgreed) {
      acknowledgeRegion();
    }
  };

  return (
    <Dialog open={shouldShowModal} onOpenChange={() => {}}>
      <DialogContent
        className="w-[95vw] sm:w-[90vw] max-w-md bg-[#1A1F2C] border-gray-700 text-white flex flex-col p-0 gap-0 z-[200]"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-700/50">
          <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </div>
          
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-white">
              Access Restricted
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm leading-relaxed">
              It appears you are accessing this application from a region where its 
              use may be restricted. By proceeding, you acknowledge that you are 
              solely responsible for complying with all applicable local laws and 
              regulations, and you agree to our{" "}
              <a 
                href="/terms" 
                className="text-[#9b87f5] hover:text-[#8b5cf6] underline"
                target="_blank"
              >
                Terms of Use
              </a>.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Location Info */}
          <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-4 w-4 text-[#9b87f5]" />
              <span className="text-sm font-medium text-gray-300">Detected Location</span>
            </div>
            <p className="text-white font-semibold">
              {country} ({countryCode})
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {getRestrictionMessage(countryCode)}
            </p>
          </div>

          {/* Acknowledgment */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-[#9b87f5] focus:ring-[#9b87f5] focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300 leading-relaxed">
                I acknowledge and agree to the terms of use.
              </span>
            </label>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleContinue}
            disabled={!hasAgreed}
            className={`w-full h-12 font-medium transition-all duration-200 ${
              hasAgreed
                ? "bg-gradient-to-r from-[#9b87f5] to-[#8b5cf6] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white shadow-lg shadow-[#9b87f5]/25"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {hasAgreed ? (
              <>
                Continue
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Please acknowledge the terms"
            )}
          </Button>

          {/* Alternative Options */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-400">
              Need help accessing ChimeraAI from your region?
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#9b87f5] hover:text-[#8b5cf6] hover:bg-[#9b87f5]/10 text-xs"
              onClick={() => window.open('mailto:support@chimeraai.com', '_blank')}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}