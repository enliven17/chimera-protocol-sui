"use client";

import { useEffect, useState } from "react";

export function TermsModal() {
  // const {
  //   showTermsModal,
  //   hasAcceptedTerms,
  //   acceptTerms,
  //   declineTerms,
  //   hasAcknowledgedRegion,
  //   isLoadingRegion,
  // } = useTermsStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server side
  if (!isClient) return null;

  // DON'T SHOW TERMS MODAL - User acknowledged region terms already
  // Only show if specifically needed for other purposes (which we don't want)
  // const shouldShowModal = false; // Disable terms modal completely

  return null; // Don't render the terms modal at all
}