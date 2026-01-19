"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export interface MenuItem {
  label: string;
  href: string;
  isActive: boolean;
  isLoggedIn?: boolean;
}

interface MobileNavigationProps {
  items: MenuItem[];
}

export function MobileNavigation({ items }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card">
          <div className="flex flex-col space-y-6 mt-8">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-lg font-medium transition-colors duration-200 py-3 px-4 rounded-md ${
                  item.isActive
                    ? "text-primary bg-primary/10 border-l-4 border-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
