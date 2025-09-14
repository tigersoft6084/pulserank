import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { UserPlanDistribution } from "@/components/Charts/user-plan-distribution";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { RecentActivityCard } from "./_components/recentActivity-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { ThirdPartyServicesStatus } from "./_components/third-party-services-status";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          key={extractTimeFrame("payments_overview")}
          timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
        />
        <div className="col-span-12 xl:col-span-5">
          <ThirdPartyServicesStatus />
        </div>
        <UserPlanDistribution className="col-span-12 xl:col-span-7" />

        <div className="col-span-12 space-y-6 xl:col-span-5">
          <Suspense fallback={null}>
            <RecentActivityCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
