import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { handleAPIError } from "@/lib/utils/error-handler";

export async function GET() {
  try {
    const service = await prisma.thirdPartyService.findFirst({
      where: {
        name: "Intercom",
      },
      select: {
        config: true,
      },
    });
    const config = service?.config as { appId: string } | null;
    const appId = config?.appId || "";
    return NextResponse.json(
      {
        appId,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
