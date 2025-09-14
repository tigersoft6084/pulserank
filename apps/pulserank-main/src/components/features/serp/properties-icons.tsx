import {
  Search,
  ShoppingCart,
  Brain,
  TrendingUp,
  Star,
  Image,
  Video,
  MapPin,
  Calendar,
  Users,
  BookOpen,
  Globe,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  HelpCircle,
  Link,
  FileText,
  Bot,
  ScanSearch,
  Eye,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

// Map of property names to their corresponding icons and tooltips
const propertyIconMap: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; tooltip: string }
> = {
  organic: { icon: Search, tooltip: "organic" },
  ai_overview: {
    icon: Bot,
    tooltip: "aiOverview",
  },
  people_also_ask: { icon: HelpCircle, tooltip: "peopleAlsoAsk" },
  people_also_search: {
    icon: ScanSearch,
    tooltip: "peopleAlsoSearch",
  },
  perspectives: {
    icon: Eye,
    tooltip: "perspectives",
  },
  product_considerations: {
    icon: ShoppingCart,
    tooltip: "productConsiderations",
  },
  related_searches: { icon: TrendingUp, tooltip: "relatedSearches" },
  knowledge_graph: { icon: Brain, tooltip: "knowledgeGraph" },
  featured_snippet: { icon: Star, tooltip: "featuredSnippet" },
  images: { icon: Image, tooltip: "images" },
  videos: { icon: Video, tooltip: "videos" },
  local_pack: { icon: MapPin, tooltip: "localPack" },
  news: { icon: Calendar, tooltip: "news" },
  reviews: { icon: Users, tooltip: "reviews" },
  shopping: { icon: ShoppingCart, tooltip: "shopping" },
  books: { icon: BookOpen, tooltip: "books" },
  flights: { icon: Globe, tooltip: "flights" },
  hotels: { icon: MapPin, tooltip: "hotels" },
  jobs: { icon: Target, tooltip: "jobs" },
  finance: { icon: BarChart3, tooltip: "finance" },
  recipes: { icon: Lightbulb, tooltip: "recipes" },
  faq: { icon: HelpCircle, tooltip: "faq" },
  sitelinks: { icon: Link, tooltip: "sitelinks" },
  ads: { icon: Zap, tooltip: "ads" },
  // Add more mappings as needed
};

interface PropertiesIconsProps {
  properties: string[];
  className?: string;
}

export function PropertiesIcons({
  properties,
  className = "",
}: PropertiesIconsProps) {
  if (!properties || properties.length === 0) {
    return <span className="text-gray-400">-</span>;
  }

  const t = useTranslations("serpMachine.propertiesTooltip");

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        {properties.map((property, index) => {
          const propertyConfig = propertyIconMap[property.toLowerCase()];

          if (!propertyConfig) {
            // Fallback for unknown properties
            return (
              <Tooltip key={`${property}-${index}`}>
                <TooltipTrigger asChild>
                  <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                    <FileText className="w-3 h-3 text-gray-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{property}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          const IconComponent = propertyConfig.icon;

          return (
            <Tooltip key={`${property}-${index}`}>
              <TooltipTrigger asChild>
                <IconComponent className="w-4 h-4 text-gray-600 hover:text-gray-800" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t(propertyConfig.tooltip)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
