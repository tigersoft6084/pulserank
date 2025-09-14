import { DotIcon } from "@/assets/icons";
import { formatMessageTime } from "@/lib/format-message-time";
import Link from "next/link";
import { getRecentBillingHistory } from "../fetch";

type ActivityItem = {
  type: "payment" | "subscription" | "cancellation" | "user";
  message: string;
  time: string;
  amount?: string | null;
  eventType: string;
};

export async function RecentActivityCard() {
  const recentActivity: ActivityItem[] = await getRecentBillingHistory();
  return (
    <div className="col-span-12 h-full rounded-[10px] bg-white py-6 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-4">
      <div className="mb-5.5 flex items-center justify-between px-7.5">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Recent Billing History
        </h2>
        <Link
          href="/sales-management?tab=billing-history"
          className="text-sm font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
        >
          View All
        </Link>
      </div>

      <ul>
        {recentActivity.map((activity: ActivityItem, key: number) => (
          <li key={key}>
            <Link
              href="/"
              className="flex items-center gap-4.5 px-7.5 py-3 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
            >
              <div className="relative shrink-0">
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.type === "user"
                      ? "bg-green-500"
                      : activity.type == "subscription"
                        ? "bg-orange-500"
                        : activity.type == "payment"
                          ? "bg-blue-500"
                          : activity.type == "cancellation"
                            ? "bg-red-500"
                            : ""
                  }`}
                ></div>
              </div>

              <div className="relative flex-grow">
                <h3 className="font-medium text-dark dark:text-white">
                  {activity.message}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <DotIcon />

                  <time className="text-xs" dateTime={activity.time}>
                    {formatMessageTime(activity.time)}
                  </time>

                  {activity.amount && (
                    <>
                      <DotIcon />
                      <span className="text-xs font-medium text-primary">
                        {activity.amount}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
