"use client";
import { useCallback, useEffect, useState } from "react";
import { useIntercom } from "react-use-intercom";

// Define proper types for Intercom update data
interface IntercomUpdateData {
  name?: string;
  email?: string;
  userId?: string;
  customAttributes?: Record<string, string | number | boolean>;
  avatar?: {
    imageUrl: string;
    type: "avatar";
  };
}

export const useIntercomSafe = () => {
  const { boot, update, shutdown, hide, show, trackEvent } = useIntercom();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment and location is available
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.href
    ) {
      setIsReady(true);
    }
  }, []);

  const safeBoot = useCallback(() => {
    if (!isReady) {
      console.warn("Intercom not ready yet, skipping boot");
      return;
    }
    try {
      boot();
    } catch (error) {
      console.error("Intercom boot error:", error);
    }
  }, [boot, isReady]);

  const safeUpdate = useCallback(
    (data: IntercomUpdateData) => {
      if (!isReady) {
        console.warn("Intercom not ready yet, skipping update");
        return;
      }
      try {
        update(data);
      } catch (error) {
        console.error("Intercom update error:", error);
      }
    },
    [update, isReady],
  );

  const safeShutdown = useCallback(() => {
    if (!isReady) return;
    try {
      shutdown();
    } catch (error) {
      console.error("Intercom shutdown error:", error);
    }
  }, [shutdown, isReady]);

  const safeHide = useCallback(() => {
    if (!isReady) return;
    try {
      hide();
    } catch (error) {
      console.error("Intercom hide error:", error);
    }
  }, [hide, isReady]);

  const safeShow = useCallback(() => {
    if (!isReady) return;
    try {
      show();
    } catch (error) {
      console.error("Intercom show error:", error);
    }
  }, [show, isReady]);

  const safeTrackEvent = useCallback(
    (eventName: string, metadata?: Record<string, unknown>) => {
      if (!isReady) return;
      try {
        trackEvent(eventName, metadata);
      } catch (error) {
        console.error("Intercom track event error:", error);
      }
    },
    [trackEvent, isReady],
  );

  return {
    isReady,
    boot: safeBoot,
    update: safeUpdate,
    shutdown: safeShutdown,
    hide: safeHide,
    show: safeShow,
    trackEvent: safeTrackEvent,
  };
};
