import { useState, useEffect } from "react";

interface BrowserAPIs {
  isClient: boolean;
  location: Location | null;
  pathname: string;
  href: string;
}

export function useBrowserAPIs(): BrowserAPIs {
  const [browserAPIs, setBrowserAPIs] = useState<BrowserAPIs>({
    isClient: false,
    location: null,
    pathname: "",
    href: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBrowserAPIs({
        isClient: true,
        location: window.location,
        pathname: window.location.pathname,
        href: window.location.href,
      });
    }
  }, []);

  return browserAPIs;
}
