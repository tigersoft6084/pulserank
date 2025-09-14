import { ThirdPartyServiceData } from "@/services/third-party-services.service";
import cron from "node-cron";

const sendTelegramMessage = async (message: string) => {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: process.env.TG_CHAT_ID,
        text: message,
      }),
    }
  );
  const data = await response.json();
  if (response.ok) {
  } else {
    console.error("Error sending message:", data);
  }
};

export function initCron(isJobScheduled: boolean) {
  console.log("[Cron] Job initialized");
  if (isJobScheduled) return;
  // every 17 pm
  cron.schedule("0 17 * * *", async () => {
    try {
      console.log(`[${new Date().toISOString()}] Cron job executed`);

      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/third-party-services`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch third party services");
      }
      const data = await response.json();
      const thirdPartyServices = data;
      if (thirdPartyServices.success) {
        const services = thirdPartyServices.data;

        services
          ?.filter(
            (service: ThirdPartyServiceData) => service.name !== "Intercom"
          )
          .forEach((service: ThirdPartyServiceData) => {
            const mainValue = Object.values(service.data) || [];
            if (mainValue.some((value: number) => value <= service.threshold)) {
              sendTelegramMessage(
                `Service ${service?.name} is running low on resources. Please check the configuration.`
              );
            }
          });
      }
      Promise.all([
        fetch(`${process.env.NEXTAUTH_URL}/api/cron/serp-collection`, {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }),
        fetch(`${process.env.NEXTAUTH_URL}/api/cron/cache-cleanup`, {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }),
        fetch(`${process.env.NEXTAUTH_URL}/api/cron/backlinks-collection`, {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }),
      ]).catch((err) => {
        console.error(err);
      });
    } catch (err) {
      console.log(err);
    }
  });
}
