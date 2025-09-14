"use client";
import React, { type ReactNode, useEffect, useState } from "react";
import { IntercomProvider } from "react-use-intercom";
import { useIntercomService } from "@/hooks/features/third-party-services/use-third-party-service";

interface IntercomProviderWrapperProps {
  children?: ReactNode;
}

const IntercomProviderWrapper: React.FC<IntercomProviderWrapperProps> = ({
  children,
}) => {
  const { data: intercomServices } = useIntercomService();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure Intercom only initializes after the page is fully loaded and stable
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.href
    ) {
      // Add a small delay to ensure the page is stable after any navigation
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render Intercom until ready and we have an app ID
  if (!isReady || !intercomServices?.appId) {
    return <>{children}</>;
  }

  return (
    <IntercomProvider
      appId={intercomServices.appId}
      autoBoot={false} // Disable auto-boot to prevent race conditions
      shouldInitialize={true}
    >
      {children}
    </IntercomProvider>
  );
};

export default IntercomProviderWrapper;
