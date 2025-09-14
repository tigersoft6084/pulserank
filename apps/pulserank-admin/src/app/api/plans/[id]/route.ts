import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        userOrders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      name,
      price,
      interval,
      constraints,
      currency,
      paypalPlanId,
      active,
    } = body;
    const { id } = await params;
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(interval && { interval }),
        ...(constraints && { constraints }),
        ...(currency && { currency }),
        ...(paypalPlanId && { paypalPlanId }),
        ...(typeof active === "boolean" && { active }),
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    // Check if plan has active subscriptions
    const planWithOrders = await prisma.plan.findUnique({
      where: { id },
      include: {
        userOrders: {
          where: { status: "active" },
        },
      },
    });

    if (!planWithOrders) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (planWithOrders.userOrders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete plan with active subscriptions" },
        { status: 400 }
      );
    }

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
