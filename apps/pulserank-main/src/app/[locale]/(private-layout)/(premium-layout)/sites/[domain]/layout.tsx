"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Anchor,
  CaseUpper,
  Eye,
  Flag,
  Globe,
  LayoutGrid,
  LinkIcon,
  List,
  Rocket,
  Check,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  useAddToWatchlist,
  useCheckWatchlistStatus,
} from "@/hooks/features/watchlist/use-watchlist";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import {
  useCheckDomainUnlockStatus,
  useUnlockDomain,
} from "@/hooks/features/user/use-unlocked-domains";

export default function SiteViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { domain } = useParams();
  const { toast } = useToast();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";

  const {
    mutate: addToWatchlist,
    isPending: addingToWatchlist,
    isSuccess: addedToWatchlist,
    isError: addingToWatchlistError,
    error: addingToWatchlistErrorData,
  } = useAddToWatchlist();
  const { data: isInWatchlist, isLoading: checkingWatchlist } =
    useCheckWatchlistStatus(domainString);

  const { data: isDomainUnlocked, isLoading: checkingUnlockStatus } =
    useCheckDomainUnlockStatus(domainString);
  const {
    mutate: unlockDomain,
    isPending: unlockingDomain,
    isSuccess: unlockedDomain,
    isError: unlockingDomainError,
    error: unlockingDomainErrorData,
  } = useUnlockDomain();

  const tabs = [
    {
      label: "Identity Card",
      href: `/sites/${domainString}/view`,
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      label: "Backlinks history",
      href: `/sites/${domainString}/backlinks`,
      icon: <LinkIcon className="w-4 h-4" />,
    },
    {
      label: "Top Backlinks",
      href: `/sites/${domainString}/top`,
      icon: <Rocket className="w-4 h-4" />,
    },
    {
      label: "Anchors",
      href: `/sites/${domainString}/anchors`,
      icon: <Anchor className="w-4 h-4" />,
    },
    {
      label: "Referring Domains",
      href: `/sites/${domainString}/refdomains`,
      icon: <Globe className="w-4 h-4" />,
    },
    {
      label: "Topics",
      href: `/sites/${domainString}/topics`,
      icon: <Flag className="w-4 h-4" />,
    },
    {
      label: "Content",
      href: `/sites/${domainString}/keywords`,
      icon: <CaseUpper className="w-4 h-4" />,
    },
    {
      label: "Top pages",
      href: `/sites/${domainString}/top_pages`,
      icon: <List className="w-4 h-4" />,
    },
  ];

  const pathname = usePathname();

  // Remove locale from pathname
  const pathWithoutLocale = pathname.split("/").slice(2).join("/");
  const isCurrentTab = (href: string) => `/${pathWithoutLocale}` === href;

  useEffect(() => {
    if (addedToWatchlist) {
      toast({
        title: "Success",
        description: "Added to watchlist",
      });
    }
    if (addingToWatchlistError) {
      toast({
        title: "Error",
        description: addingToWatchlistErrorData?.message,
        variant: "destructive",
      });
    }
  }, [
    addedToWatchlist,
    addingToWatchlistError,
    addingToWatchlistErrorData,
    toast,
  ]);

  useEffect(() => {
    if (unlockedDomain) {
      toast({
        title: "Success",
        description: "Domain unlocked",
      });
    }
    if (unlockingDomainError) {
      toast({
        title: "Error",
        description: unlockingDomainErrorData?.message,
        variant: "destructive",
      });
    }
  }, [unlockedDomain, unlockingDomainError, unlockingDomainErrorData, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 justify-between">
        {isDomainUnlocked ? (
          <div className="flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-lg">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "text-sm text-muted-foreground font-semibold px-3 py-1 rounded-md flex items-center gap-2",
                    isCurrentTab(tab.href) &&
                      "bg-card text-foreground font-medium shadow-sm",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              ))}
            </div>
            <Button
              onClick={() => addToWatchlist({ url: domainString })}
              disabled={addingToWatchlist || checkingWatchlist || isInWatchlist}
              variant={isInWatchlist ? "outline" : "default"}
            >
              {addingToWatchlist ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isInWatchlist ? (
                <Check className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isInWatchlist ? "Watching this site" : "Add to Watchlist"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end w-full">
            <Button
              onClick={() => unlockDomain(domainString)}
              disabled={unlockingDomain || checkingUnlockStatus}
              variant="default"
              className="flex items-center gap-2"
            >
              {unlockingDomain ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Unlock Backlinks+Keywords View
            </Button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
