import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbSegment {
  title: string;
  href?: string;
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  segments: BreadcrumbSegment[];
  separator?: React.ReactNode;
  homeHref?: string;
}

export function Breadcrumb({
  segments,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  homeHref = "/dashboard",
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    >
      <ol className="flex items-center gap-2">
        <li>
          <Link
            href={homeHref}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center text-muted-foreground">
              {separator}
            </li>
            <li>
              {segment.href ? (
                <Link
                  href={segment.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {segment.title}
                </Link>
              ) : (
                <span className="text-foreground font-medium">
                  {segment.title}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
