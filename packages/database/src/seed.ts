import { PrismaClient } from "../generated/prisma";
import * as bcrypt from "bcryptjs";
import * as process from "process";

const prisma = new PrismaClient();

// Import the real PayPal service
import { paypalService } from "../../../apps/pulserank-admin/src/services/paypal.service";

// Run on module load (only once per server boot)
async function init() {
  try {
    const plans = await prisma.plan.findMany();
    const admins = await prisma.admin.findMany();
    const thirdPartyServices = await prisma.thirdPartyService.findMany();

    if (
      plans.length >= 6 &&
      admins.length !== 0 &&
      thirdPartyServices.length === 4
    ) {
      throw new Error("Already initialized");
    }

    // create third party services
    const thirdPartyServicesData = [
      {
        name: "Majestic",
        config: {
          apiKey: process.env.MAJESTIC_API_KEY || "",
        },
        threshold: 1000,
      },
      {
        name: "DataForSeo",
        config: {
          email: process.env.DATAFORSEO_LOGIN || "",
          password: process.env.DATAFORSEO_PASSWORD || "",
        },
        threshold: 1000,
      },
      {
        name: "SEMRush",
        config: {
          apiKey: process.env.SEMRUSH_API_KEY || "",
        },
        threshold: 1000,
      },
      {
        name: "Intercom",
        config: {
          appId: process.env.INTERCOM_APP_ID || "",
        },
        threshold: 0,
      },
    ];

    const plansData = [
      {
        name: "Freelance",
        price: 99,
        interval: "MONTH",
        constraints: { keywords: 150, unlockedDomains: 100, trackingSites: 20 },
      },
      {
        name: "Studio",
        price: 199,
        interval: "MONTH",
        constraints: { keywords: 500, unlockedDomains: 300, trackingSites: 50 },
      },
      {
        name: "Agency",
        price: 399,
        interval: "MONTH",
        constraints: {
          keywords: 2000,
          unlockedDomains: 1000,
          trackingSites: 500,
        },
      },
      {
        name: "Freelance",
        price: 99 * 10,
        interval: "YEAR",
        constraints: { keywords: 150, unlockedDomains: 100, trackingSites: 20 },
      },
      {
        name: "Studio",
        price: 199 * 10,
        interval: "YEAR",
        constraints: { keywords: 500, unlockedDomains: 300, trackingSites: 50 },
      },
      {
        name: "Agency",
        price: 399 * 10,
        interval: "YEAR",
        constraints: {
          keywords: 2000,
          unlockedDomains: 1000,
          trackingSites: 500,
        },
      },
    ];

    if (thirdPartyServices.length !== 4) {
      try {
        await prisma.thirdPartyService.deleteMany();
        const remainingThirdPartyServices =
          await prisma.thirdPartyService.count();
        if (remainingThirdPartyServices !== 0) {
          throw new Error("Failed to delete existing third party services");
        }
        for (const thirdPartyService of thirdPartyServicesData) {
          await prisma.thirdPartyService.create({
            data: thirdPartyService,
          });
        }
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create third party services");
      }
    }

    if (admins.length === 0) {
      try {
        await prisma.admin.deleteMany();
        const remainingAdmin = await prisma.admin.count();
        console.log(remainingAdmin);
        if (remainingAdmin !== 0) {
          throw new Error("Failed to delete existing admins");
        }

        // Use default values if environment variables are not set
        const adminEmail = process.env.ADMIN_EMAIL || "admin@pulserank.io";
        const adminPassword = process.env.ADMIN_PASSWORD || "Administr@t0r";

        await prisma.admin.create({
          data: {
            email: adminEmail,
            password: await bcrypt.hash(adminPassword, 10),
          },
        });
      } catch (error) {
        console.error(error);
        throw new Error("Failed to create admin user");
      }
    }

    if (!paypalService.isConfigured()) {
      console.log(
        "PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables."
      );
      console.log(
        "PayPal product ID not configured. Set PAYPAL_PRODUCT_ID environment variable."
      );
    }

    if (plans.length < 6) {
      try {
        await prisma.plan.deleteMany();
        const remainingPlans = await prisma.plan.count();
        if (remainingPlans !== 0) {
          throw new Error("Failed to delete existing plans");
        }
        for (const plan of plansData) {
          // Check if PayPal is configured before creating plans
          if (!paypalService.isConfigured()) {
            console.warn(
              "PayPal is not configured. Skipping plan creation for:",
              plan.name
            );
            continue;
          }

          const planRes = await paypalService.createPlan({
            name: plan.name,
            price: plan.price,
            interval: plan.interval,
            currency: "USD",
          });

          if (planRes.success && planRes.planId) {
            // Create plan with real PayPal plan ID
            await prisma.plan.create({
              data: {
                name: plan.name,
                price: plan.price,
                interval: plan.interval,
                paypalPlanId: planRes.planId,
                active: true,
                constraints: plan.constraints,
              },
            });
            console.log(
              `Successfully created PayPal plan: ${plan.name} with ID: ${planRes.planId}`
            );
          } else {
            console.error(
              "Failed to create PayPal plan:",
              plan.name,
              planRes.message
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

init()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
