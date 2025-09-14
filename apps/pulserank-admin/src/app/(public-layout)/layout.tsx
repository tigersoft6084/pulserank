import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function PublicLayout({ children }: PropsWithChildren) {
  const session = await getUser();
  // If user is authenticated and has active subscription, redirect to dashboard
  if (session?.user) {
    return redirect("/");
  }

  // Note: Authenticated users without subscriptions should access subscription page through private layout
  // This prevents redirect loops

  return <>{children}</>;
}
