"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function SignOutButton() {
  const t = useTranslations("auth.signOut");

  return (
    <button
      className="w-24"
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
    >
      {t("signOut")}
    </button>
  );
}
