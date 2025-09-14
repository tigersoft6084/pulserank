import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userHistories = await prisma.userHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      {
        success: true,
        userHistories,
        message: "User histories retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user histories:", error);
    return NextResponse.json(
      { error: "Failed to fetch user histories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      description,
      item,
      cost = 0,
      pinned = false,
    } = await request.json();

    if (!description || !item) {
      return NextResponse.json(
        { error: "Description and item are required" },
        { status: 400 }
      );
    }

    const userHistory = await prisma.userHistory.create({
      data: {
        userId: session.user.id,
        description,
        item,
        cost,
        pinned,
      },
    });

    return NextResponse.json(
      {
        success: true,
        userHistory,
        message: "User history created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user history:", error);
    return NextResponse.json(
      { error: "Failed to create user history" },
      { status: 500 }
    );
  }
}
