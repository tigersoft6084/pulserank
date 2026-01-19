import { PropsWithChildren } from "react";
import { getUser } from "@/lib/auth";
import { DashboardTourProvider } from "@/providers/tour/dashboard-tour-provider";
// import { BreadcrumbNavWithHeading } from "@/components/layout/breadcrumb-nav";

export default async function PrivateLayout({ children }: PropsWithChildren) {
  const session = await getUser();

  return (
    <DashboardTourProvider>
      <div className="flex flex-col min-h-screen w-full">
        <div className="container flex flex-col flex-1 mx-auto py-4 px-4">
          {/* <BreadcrumbNavWithHeading /> */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </DashboardTourProvider>
  );
}
