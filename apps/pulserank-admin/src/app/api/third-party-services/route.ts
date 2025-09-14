import { NextRequest, NextResponse } from "next/server";
import {
  checkSemrushState,
  checkMajesticState,
  checkDataforseoState,
} from "@/lib/thirdparty-state-check";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
// GET - Retrieve all third-party services
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    const session = await getUser();

    if (!session?.user?.id && token !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // check bearer token

    const services = await prisma.thirdPartyService.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const serviceData = [];

    for (const service of services) {
      let data;
      if (service.name === "SEMRush") {
        const config = service.config as { apiKey: string } | null;
        if (config?.apiKey) {
          const res = await checkSemrushState(config.apiKey);
          data = { "API Units": res !== null ? res : 0 };
        } else {
          data = { "API Units": 0 };
        }
      }
      if (service.name === "Majestic") {
        const config = service.config as { apiKey: string } | null;
        if (config?.apiKey) {
          const res = await checkMajesticState(config.apiKey);
          data = {
            IndexItemInfoResUnits:
              res !== null ? res["TotalIndexItemInfoResUnits"] : 0,
            RetrievalResUnits: res !== null ? res["TotalRetrievalResUnits"] : 0,
            AnalysisResUnits: res !== null ? res["TotalAnalysisResUnits"] : 0,
          };
        } else {
          data = {
            IndexItemInfoResUnits: 0,
            RetrievalResUnits: 0,
            AnalysisResUnits: 0,
          };
        }
      }
      if (service.name === "DataForSeo") {
        const config = service.config as {
          email: string;
          password: string;
        } | null;
        if (config?.email && config?.password) {
          const res = await checkDataforseoState(config.email, config.password);
          data = {
            "Current Balance":
              res !== null
                ? res["tasks"][0]["result"][0]["money"]["balance"]
                : 0,
          };
        } else {
          data = { "Current Balance": 0 };
        }
      }
      serviceData.push({
        ...service,
        data,
        lastSync: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: serviceData,
      count: serviceData.length,
    });
  } catch (error) {
    console.error("Error fetching third-party services:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch third-party services",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new third-party service
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { name, config, threshold } = body;

    // Validate required fields
    if (!name || !config || threshold === undefined) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, config, and threshold are required",
        },
        { status: 400 }
      );
    }

    const service = await prisma.thirdPartyService.create({
      data: {
        name,
        config,
        threshold: parseFloat(threshold),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating third-party service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create third-party service",
      },
      { status: 500 }
    );
  }
}

// PUT - Update an existing third-party service
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { id, config, threshold } = body;

    // Validate required fields
    if (!id || !config) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id and config are required",
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      config,
      updatedAt: new Date(),
    };

    // Add threshold to update if provided
    if (threshold !== undefined) {
      updateData.threshold = parseFloat(threshold);
    }

    const service = await prisma.thirdPartyService.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error updating third-party service:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update third-party service",
      },
      { status: 500 }
    );
  }
}
