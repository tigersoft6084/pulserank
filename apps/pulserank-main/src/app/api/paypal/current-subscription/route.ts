import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getUser();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userOrder = await prisma.userOrder.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        logs: {
          include: {
            userOrder: {
              select: {
                paypalSubscriptionId: true,
              },
            },
          },
        },
        plan: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        userOrder,
        message: "Current plan retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch current subscription" },
      { status: 500 }
    );
  }
}
