import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DashboardTourProvider } from "@/providers/tour/dashboard-tour-provider";
import { BreadcrumbNavWithHeading } from "@/components/layout/breadcrumb-nav";

export default async function PrivateLayout({ children }: PropsWithChildren) {
  const session = await getUser();

  if (!session?.user.isActive) {
    return redirect("/subscription");
  }

  return (
    <DashboardTourProvider>
      <div className="flex flex-col min-h-screen w-full">
        {session?.user?.isActive && <Header />}
        <div className="container flex flex-col flex-1 mx-auto py-4 px-4">
          <BreadcrumbNavWithHeading />
          <main className="flex-1">{children}</main>
        </div>
        {session?.user?.isActive && <Footer />}
      </div>
    </DashboardTourProvider>
  );
}
