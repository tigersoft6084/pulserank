"use client";

import {
  CalendarDays,
  // ChartArea,
  ChartLine,
  Download,
  Eye,
  Factory,
  FlaskConical,
  GitCompare,
  GitCompareArrows,
  HistoryIcon,
  InspectionPanel,
  LinkIcon,
  ListCollapse,
  Menu,
  NotebookText,
  Plug,
  Search,
  SendToBack,
  // Split,
  Star,
  Target,
  // TrendingUp,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { SerpBaseSwitcher } from "./header/serpbase-switcher";
import Profile from "../features/account/profile";
import { Credit } from "./header/credit";
import { AuthTitle } from "./header/auth-title";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../ui/sheet";
import { useRouter } from "@/i18n/navigation";

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  description?: string;
  href?: string;
  header?: string;
  items?: Array<{
    title: string;
    icon: React.ReactNode;
    description?: string;
    href?: string;
    header?: string;
  }>;
};

const menuItems: MenuItem[] = [
  {
    title: "rankings",
    icon: <ChartLine className="w-4 h-4" />,
    header: "rankings",
    items: [
      {
        title: "campaigns.title",
        icon: <Star className="w-4 h-4" />,
        description: "campaigns.description",
        href: "/campaigns",
      },
      {
        title: "keywords.title",
        icon: <Eye className="w-4 h-4" />,
        description: "keywords.description",
        href: "/campaigns/keywords",
      },
    ],
  },
  {
    title: "backlinks",
    icon: <LinkIcon className="w-4 h-4" />,
    href: "/backlinks",
    header: "backlinks",
    items: [
      {
        title: "watchList.title",
        icon: <Eye className="w-4 h-4" />,
        description: "watchList.description",
        href: "/watchlist",
      },
      {
        title: "commonBacklinks.title",
        icon: <SendToBack className="w-4 h-4" />,
        description: "commonBacklinks.description",
        href: "/sites/backlinksincommon",
      },
      {
        title: "expressExtraction.title",
        icon: <Factory className="w-4 h-4" />,
        description: "expressExtraction.description",
        href: "/sites/list_top_backlinks",
      },
      {
        title: "timeline.title",
        icon: <CalendarDays className="w-4 h-4" />,
        description: "timeline.description",
        href: "/positions/serp_backlinks",
      },
      {
        title: "sameIp.title",
        icon: <Search className="w-4 h-4" />,
        description: "sameIp.description",
        href: "/sites/same_ip_checker",
      },
      {
        title: "urlInfo.title",
        icon: <ListCollapse className="w-4 h-4" />,
        description: "urlInfo.description",
        href: "/urls/info",
      },
    ],
  },
  {
    title: "keywords",
    icon: <NotebookText className="w-4 h-4" />,
    header: "keywords",
    items: [
      {
        title: "nicheFinder.title",
        icon: <Factory className="w-4 h-4" />,
        description: "nicheFinder.description",
        href: "/nichefinder",
      },
      {
        title: "competition.title",
        icon: <Target className="w-4 h-4" />,
        description: "competition.description",
        href: "/positions/competition",
      },
    ],
  },
  {
    title: "labs",
    icon: <FlaskConical className="w-4 h-4" />,
    header: "labs",
    items: [
      {
        title: "compareSites.title",
        icon: <GitCompare className="w-4 h-4" />,
        description: "compareSites.description",
        href: "/sites/compare",
      },
      {
        title: "domainProfiler.title",
        icon: <InspectionPanel className="w-4 h-4" />,
        description: "domainProfiler.description",
        href: "/sites/websiteprofiler",
      },
      {
        title: "domainExtractor.title",
        icon: <Download className="w-4 h-4" />,
        description: "domainExtractor.description",
        href: "/domainextractor",
      },
      // {
      //   title: "trafficMachine.title",
      //   icon: <Split className="w-4 h-4" />,
      //   description: "trafficMachine.description",
      //   href: "/serps/trafficmachine",
      // },
      // {
      //   title: "volatilityExplorer.title",
      //   icon: <TrendingUp className="w-4 h-4" />,
      //   description: "volatilityExplorer.description",
      //   href: "/serps/volatilityexplorer",
      // },
      {
        title: "websiteInterlink.title",
        icon: <GitCompareArrows className="w-4 h-4" />,
        description: "websiteInterlink.description",
        href: "/sites/websiteinterlink",
      },
      // {
      //   title: "visibilityComparator.title",
      //   icon: <ChartArea className="w-4 h-4" />,
      //   description: "visibilityComparator.description",
      //   href: "/organic_keywords/visibility_history",
      // },
    ],
  },
  {
    title: "api",
    icon: <Plug className="w-4 h-4" />,
    header: "api",
    href: "/users/api",
  },
];

export function Header() {
  const t = useTranslations("header");
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(
        `/serpmachine?keyword=${encodeURIComponent(searchValue.trim())}`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header
      className="flex w-full justify-between h-16 items-center px-4 border-b bg-card"
      data-tour-id="platform-overview"
    >
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetTitle className="sr-only">{t("navigationMenu")}</SheetTitle>
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {t(item.title)}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    {item.icon}
                    {t(item.title)}
                  </div>
                )}
                {item.items && (
                  <div className="ml-6 flex flex-col gap-2">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href || "#"}
                        className="flex items-center gap-2"
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.icon}
                        {t(`navigation.${item.title}.${subItem.title}`)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <AuthTitle />

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {menuItems.map((item) =>
            item.items ? (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuTrigger className="flex items-center gap-1 bg-card">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm lg:block hidden">
                    {t(item.title)}
                  </span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex flex-col gap-2 md:w-[400px] lg:w-[500px]">
                    {item.href ? (
                      <Link href={item.href}>
                        <li className="font-bold ml-3 mt-2">
                          {t(item.header as string)}
                        </li>
                      </Link>
                    ) : (
                      <li className="font-bold ml-3 mt-2">
                        {t(item.header as string)}
                      </li>
                    )}
                    <Separator />
                    {item.items.map((subItem) => (
                      <ListItem
                        key={subItem.title}
                        title={t(`navigation.${item.title}.${subItem.title}`)}
                        href={subItem.href}
                        icon={subItem.icon}
                      >
                        {t(`navigation.${item.title}.${subItem.description}`)}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuLink href={item.href}>
                  <Button variant="ghost">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-sm lg:block hidden">
                      {t(item.title)}
                    </span>
                  </Button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Search and User Controls */}
      <div className="flex items-center gap-4">
        <div className="relative hidden xl:flex" data-tour-id="header-research">
          <div className="absolute top-3 left-3">
            <HistoryIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={t("search")}
            className="h-9 w-[250px] pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex items-center gap-2">
          <SerpBaseSwitcher />
          <Credit />
          <Profile />
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    icon: React.ReactNode;
  }
>(({ className, title, href, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href as string}
          className={cn(
            "block space-y-1 items-center select-none rounded-md px-4 py-2 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon}
            <div className="text-sm font-medium">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
