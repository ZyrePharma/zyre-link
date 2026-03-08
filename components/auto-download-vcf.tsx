"use client";

import { useEffect, useRef } from "react";

export function AutoDownloadVcf({ username }: { username: string }) {
  const hasDownloaded = useRef(false);

  useEffect(() => {
    if (!hasDownloaded.current && typeof window !== "undefined") {
      hasDownloaded.current = true;
      
      // Small delay to ensure the page has loaded visually before prompting download
      const timer = setTimeout(() => {
        // Create an invisible iframe or change location to trigger download
        window.location.href = `/api/vcard/${username}`;
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [username]);

  return null;
}
