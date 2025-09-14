import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { totalUsers, activeSubscriptions, totalRevenue, activeSubscribers } =
    await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Total Users"
        data={{
          ...totalUsers,
          value: compactFormat(totalUsers.value),
        }}
        Icon={icons.Users}
      />
      <OverviewCard
        label="Active Subscribers"
        data={{
          ...activeSubscribers,
          value: compactFormat(activeSubscribers.value),
        }}
        Icon={icons.Views}
      />
      <OverviewCard
        label="Active Subscriptions"
        data={{
          ...activeSubscriptions,
          value: compactFormat(activeSubscriptions.value),
        }}
        Icon={icons.Product}
      />
      <OverviewCard
        label="Total Revenue"
        data={{
          ...totalRevenue,
          value: "$" + compactFormat(totalRevenue.value),
        }}
        Icon={icons.Profit}
      />
    </div>
  );
}
