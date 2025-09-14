"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useIntercomSafe } from "@/hooks/features/third-party-services/use-intercom-safe";
import { useIntercomService } from "@/hooks/features/third-party-services/use-third-party-service";

const UseIntercomUpdateWithProps: React.FC = () => {
  const { data: session } = useSession();
  const { data: intercomServices } = useIntercomService();
  const { isReady, boot, update } = useIntercomSafe();

  useEffect(() => {
    // Only proceed if we have all required data and Intercom is ready
    if (intercomServices?.appId && session?.user && isReady) {
      try {
        // Boot Intercom manually since autoBoot is disabled
        boot();

        // Update user data
        update({
          name: session.user.name || undefined,
          email: session.user.email || undefined,
          userId: session.user.id,
          customAttributes: {
            isActive: session.user.isActive,
            isVerified: session.user.isVerified,
            credits: JSON.stringify(session.user.credits),
          },
        });
      } catch (error) {
        console.error("Intercom update error:", error);
      }
    }
  }, [session, update, boot, intercomServices, isReady]);

  return null;
};

export default UseIntercomUpdateWithProps;
