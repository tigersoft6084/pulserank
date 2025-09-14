import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
// import { BreadcrumbNavWithHeading } from "@/components/layout/breadcrumb-nav";
// import UseIntercomUpdateWithProps from "@/providers/intercom/use-intercom-operations";

export default async function PrivateLayout({ children }: PropsWithChildren) {
  const session = await getUser();

  if (!session?.user) {
    return redirect("/sign-in");
  }

  return (
    <>
      {/* <UseIntercomUpdateWithProps /> */}
      {children}
    </>
  );
}
