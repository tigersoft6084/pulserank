"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { label: "Welcome", href: "#welcome", isActive: true },
  { label: "Presentation", href: "#presentation", isActive: false },
  { label: "Features", href: "#features", isActive: false },
  { label: "Benefits", href: "#benefits", isActive: false },
  { label: "Price", href: "#price", isActive: false },
  { label: "Login", href: "/sign-in", isActive: false },
];

export function PublicNavigation() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav
      id="welcome"
      className="flex max-h-[72px] h-[72px] w-full justify-between border-b border-yellow-600 items-center px-4 py-2 bg-card sticky top-0 z-50"
    >
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="mx-4 min-w-[128px]">
            <Image src="/logo.svg" alt="SEObserver" width={224} height={56} />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-md ${
                item.isActive
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-8">
                {menuItems.map((item) => (
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
      </div>
    </nav>
  );
}
