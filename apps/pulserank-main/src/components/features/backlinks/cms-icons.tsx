import { FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import brand icons from simple-icons
import {
  siWordpress,
  siDrupal,
  siJoomla,
  siShopify,
  siWix,
  siSquarespace,
  siGhost,
  siWebflow,
  siHugo,
  siGatsby,
  siNextdotjs,
  siReact,
  siAngular,
  siContentful,
  siStrapi,
  siSanity,
  siNetlify,
} from "simple-icons";

// Map of CMS names to their corresponding brand icons
const cmsIconMap: Record<
  string,
  {
    icon: typeof siWordpress;
    color: string;
    label: string;
  }
> = {
  // WordPress
  wordpress: { icon: siWordpress, color: "#21759b", label: "WordPress" },
  "wordpress.org": { icon: siWordpress, color: "#21759b", label: "WordPress" },
  "wordpress.com": { icon: siWordpress, color: "#21759b", label: "WordPress" },

  // Drupal
  drupal: { icon: siDrupal, color: "#0678be", label: "Drupal" },

  // Joomla
  joomla: { icon: siJoomla, color: "#5091cd", label: "Joomla" },

  // Shopify
  shopify: { icon: siShopify, color: "#7ab55c", label: "Shopify" },

  // Wix
  wix: { icon: siWix, color: "#0c6efc", label: "Wix" },

  // Squarespace
  squarespace: { icon: siSquarespace, color: "#000000", label: "Squarespace" },

  // Ghost
  ghost: { icon: siGhost, color: "#15171a", label: "Ghost" },

  // Webflow
  webflow: { icon: siWebflow, color: "#4353ff", label: "Webflow" },

  // Static sites
  hugo: { icon: siHugo, color: "#ff4088", label: "Hugo" },
  gatsby: { icon: siGatsby, color: "#663399", label: "Gatsby" },
  nextjs: { icon: siNextdotjs, color: "#000000", label: "Next.js" },
  "next.js": { icon: siNextdotjs, color: "#000000", label: "Next.js" },
  react: { icon: siReact, color: "#61dafb", label: "React" },
  angular: { icon: siAngular, color: "#dd0031", label: "Angular" },

  // CMS platforms
  contentful: { icon: siContentful, color: "#2478cc", label: "Contentful" },
  strapi: { icon: siStrapi, color: "#2e7eea", label: "Strapi" },
  sanity: { icon: siSanity, color: "#f03e2f", label: "Sanity" },
  netlify: { icon: siNetlify, color: "#00c7b7", label: "Netlify" },
};

interface CmsIconProps {
  cms: string;
  className?: string;
}

export function CmsIcon({ cms, className = "" }: CmsIconProps) {
  if (!cms || cms === "N/A" || cms === "Unknown") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center justify-center ${className}`}>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unknown CMS</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Normalize CMS name for lookup
  const normalizedCms = cms.toLowerCase().trim();

  // Try exact match first
  let cmsConfig = cmsIconMap[normalizedCms];

  // If no exact match, try partial matching
  if (!cmsConfig) {
    const partialMatch = Object.keys(cmsIconMap).find(
      (key) => normalizedCms.includes(key) || key.includes(normalizedCms),
    );
    if (partialMatch) {
      cmsConfig = cmsIconMap[partialMatch];
    }
  }

  // If still no match, use default
  if (!cmsConfig) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center justify-center ${className}`}>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unknown CMS</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const iconData = cmsConfig.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center justify-center ${className}`}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={cmsConfig.color}
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <path d={iconData.path} />
            </svg>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{cmsConfig.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
