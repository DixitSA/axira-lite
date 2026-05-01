"use client";

import { useState, useEffect } from "react";
import { buildSMSLink } from "@/lib/sms-link";
import { showToast } from "@/components/ui/toast";

export function useSmsLink() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /android|iphone|ipad|ipod/i;
    setIsMobile(mobileRegex.test(userAgent));
  }, []);

  const openSMS = (phone: string, message: string) => {
    const link = buildSMSLink(phone, message);
    
    if (!isMobile) {
      showToast("SMS links work best on a mobile device", "neutral");
    }

    // Attempt to open the link
    window.open(link, "_blank");
    
    // Show success toast
    showToast("Opening messaging app...");
  };

  return { openSMS, isMobile };
}
