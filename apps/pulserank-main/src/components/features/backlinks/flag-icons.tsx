"use client";

import {
  ArrowRightLeft,
  Square,
  Image,
  FileText,
  MessageSquare,
  Check,
  CircleSlash2,
  CircleX,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BacklinkFlags } from "@/types/backlinks";

interface FlagIconsProps {
  Flags: BacklinkFlags;
  onFlagClick?: (flagIndex: number) => void;
  activeFilters?: Set<number>;
}

export const flagIconMap = [
  {
    icon: Check,
    label: "DoFollow",
    textColor: "text-green-600",
  },
  {
    icon: ArrowRightLeft,
    label: "Redirect",
    textColor: "text-orange-500",
  },
  {
    icon: Square,
    label: "Frame",
    textColor: "text-purple-500",
  },
  {
    icon: CircleSlash2,
    label: "NoFollow",
    textColor: "text-red-500",
  },
  {
    icon: Image,
    label: "Image",
    textColor: "text-blue-500",
  },
  {
    icon: CircleX,
    label: "Deleted",
    textColor: "text-gray-500",
  },
  {
    icon: FileText,
    label: "AltText",
    textColor: "text-green-500",
  },
  {
    icon: MessageSquare,
    label: "Mention",
    textColor: "text-pink-500",
  },
];

export function FlagIcons({
  Flags,
  onFlagClick,
  activeFilters = new Set(),
}: FlagIconsProps) {
  const flagKeys = [
    "doFollow",
    "redirect",
    "frame",
    "noFollow",
    "images",
    "deleted",
    "altText",
    "mention",
  ];

  const flagConfigs = flagIconMap.map((iconConfig, index) => ({
    enabled: Flags[flagKeys[index] as keyof typeof Flags],
    ...iconConfig,
  }));

  return (
    <TooltipProvider>
      <div className="flex flex-nowrap gap-1 items-center">
        {/* Show other flags */}
        {flagConfigs.map((config, index) => {
          if (!config.enabled) return null;

          const IconComponent = config.icon;
          const isActiveFilter = activeFilters.has(index);
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => onFlagClick?.(index)}
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${config.textColor} text-xs cursor-pointer hover:opacity-80 flex-shrink-0`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {config.label} {isActiveFilter ? "(Active Filter)" : ""}
                </p>
                {isActiveFilter && (
                  <p className="text-xs text-gray-500 mt-1">
                    Click to remove filter
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
