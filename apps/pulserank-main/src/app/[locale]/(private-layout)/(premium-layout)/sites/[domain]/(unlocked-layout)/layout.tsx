"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCheckDomainUnlockStatus } from "@/hooks/features/user/use-unlocked-domains";

export default function UnlockedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { domain } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";

  const { data: isDomainUnlocked, isLoading } =
    useCheckDomainUnlockStatus(domainString);

  useEffect(() => {
    // If the domain is not unlocked and we're not on the view page, redirect to view
    if (!isLoading && !isDomainUnlocked) {
      const isOnViewPage = pathname.includes("/view");
      if (!isOnViewPage) {
        router.replace(`/sites/${domainString}/view`);
      }
    }
  }, [isDomainUnlocked, isLoading, pathname, router, domainString]);

  // Show loading while checking unlock status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If domain is not unlocked, don't render children (redirect will happen)
  if (!isDomainUnlocked) {
    return null;
  }

  // If domain is unlocked, render children normally
  return <>{children}</>;
}
