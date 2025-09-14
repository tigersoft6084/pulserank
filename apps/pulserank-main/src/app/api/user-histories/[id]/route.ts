import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@repo/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the user history belongs to the current user
    const userHistory = await prisma.userHistory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!userHistory) {
      return NextResponse.json(
        { error: "User history not found" },
        { status: 404 }
      );
    }

    await prisma.userHistory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User history deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user history:", error);
    return NextResponse.json(
      { error: "Failed to delete user history" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { pinned } = await request.json();
    if (typeof pinned !== "boolean") {
      return NextResponse.json(
        { error: "Pinned value required" },
        { status: 400 }
      );
    }
    // Verify the user history belongs to the current user
    const userHistory = await prisma.userHistory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });
    if (!userHistory) {
      return NextResponse.json(
        { error: "User history not found" },
        { status: 404 }
      );
    }
    const updated = await prisma.userHistory.update({
      where: { id },
      data: { pinned },
    });
    return NextResponse.json(
      {
        success: true,
        userHistory: updated,
        message: "User history updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user history:", error);
    return NextResponse.json(
      { error: "Failed to update user history" },
      { status: 500 }
    );
  }
}
