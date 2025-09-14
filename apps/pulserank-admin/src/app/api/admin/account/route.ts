import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/admin/account - Get current admin account info
export async function GET(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Error fetching admin account:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin account" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/account - Update admin account
export async function PUT(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    // Validate input
    if (!email && !newPassword) {
      return NextResponse.json(
        { error: "Email or new password is required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Update email if provided
    if (email && email !== admin.email) {
      // Check if email is already taken
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin && existingAdmin.id !== admin.id) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        admin.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    // Update admin account
    const updatedAdmin = await prisma.admin.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Account updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin account:", error);
    return NextResponse.json(
      { error: "Failed to update admin account" },
      { status: 500 }
    );
  }
}
