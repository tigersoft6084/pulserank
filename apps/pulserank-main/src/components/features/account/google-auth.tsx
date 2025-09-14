"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "../../ui/button";
import { useTranslations } from "next-intl";

export default function GoogleSignIn() {
  const t = useTranslations("auth.signIn");

  return (
    <Button
      variant="outline"
      onClick={() => signIn("google")}
      className="w-full flex items-center justify-start h-14"
    >
      <Image src="/icons/google.png" alt="Google" width={20} height={20} />
      <span className="ml-2 text-base font-normal">
        {t("continueWithGoogle")}
      </span>
    </Button>
  );
}
