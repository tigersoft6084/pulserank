import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/auth";
import { MobileNavigation } from "./mobile-navigation";

const menuItems = [
  { label: "Welcome", href: "#welcome", isActive: true },
  { label: "Presentation", href: "#presentation", isActive: false },
  { label: "Features", href: "#features", isActive: false },
  { label: "Benefits", href: "#benefits", isActive: false },
  { label: "Price", href: "#price", isActive: false },
  { label: "Login", href: "/sign-in", isActive: false, isLoggedIn: false },
  { label: "Logout", href: "/sign-out", isActive: false, isLoggedIn: true },
];

export async function PublicNavigation() {
  const session = await getUser();
  const isLoggedIn = !!session?.user;

  const filteredItems = menuItems.filter((item) => {
    if (isLoggedIn) {
      return item.isLoggedIn !== false;
    } else {
      return item.isLoggedIn !== true;
    }
  });

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
          {filteredItems.map((item) => (
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

        {/* Mobile Menu */}
        <MobileNavigation items={filteredItems} />
      </div>
    </nav>
  );
}
