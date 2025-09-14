import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
        roles: {
          select: {
            role: true,
            org_name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const roles = user.roles.map((r: any) => r.role);
    let userRole = "User";
    if (roles.includes("admin")) userRole = "Admin";
    else if (roles.includes("manager")) userRole = "Manager";

    const transformedUser = {
      id: user.id,
      name: user.name,
      username: user.email.split("@")[0],
      email: user.email,
      role: userRole,
      status: user.isVerified ? "Active" : "Inactive",
      joinedDate: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      image: user.image,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { name, email, role, isVerified } = body;
    const { id } = await params;
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
        roles: {
          select: {
            role: true,
            org_name: true,
          },
        },
      },
    });

    // Update role if provided
    if (role) {
      // Delete existing roles for this user
      await prisma.role.deleteMany({
        where: { user_id: id },
      });

      // Create new role
      if (existingUser.roles.length > 0) {
        const orgId = existingUser.roles[0].org_id;
        const orgName = existingUser.roles[0].org_name;

        await prisma.role.create({
          data: {
            org_id: orgId,
            org_name: orgName,
            user_id: id,
            email: updatedUser.email,
            role: role.toLowerCase(),
          },
        });
      }
    }

    // Transform the response
    const roles = updatedUser.roles.map((r: any) => r.role);
    let userRole = "User";
    if (roles.includes("admin")) userRole = "Admin";
    else if (roles.includes("manager")) userRole = "Manager";

    const transformedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.email.split("@")[0],
      email: updatedUser.email,
      role: userRole,
      status: updatedUser.isVerified ? "Active" : "Inactive",
      joinedDate: updatedUser.createdAt,
      lastActiveAt: updatedUser.lastActiveAt,
      image: updatedUser.image,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
