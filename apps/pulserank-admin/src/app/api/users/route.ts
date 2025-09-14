import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      if (status === "active") {
        //this means user has an active subscription
        where.userOrders = {
          some: {
            status: "ACTIVE",
          },
        };
      } else if (status === "inactive") {
        where.userOrders = {
          none: {
            status: "ACTIVE",
          },
        };
      }
    }

    // Get users with their roles
    const users = await prisma.user.findMany({
      where,
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
        userOrders: {
          select: {
            status: true,
            plan: {
              select: {
                name: true,
                interval: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Transform the data to match the expected format
    const transformedUsers = users
      .map((user: any) => {
        // Get the highest role (Admin > Manager > User)
        const roles = user.roles.map((r: any) => r.role);
        let userRole = "User";
        if (roles.includes("admin")) userRole = "Admin";
        else if (roles.includes("manager")) userRole = "Manager";

        // Filter by role if specified
        if (role && userRole.toLowerCase() !== role.toLowerCase()) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          username: user.email.split("@")[0], // Generate username from email
          email: user.email,
          role: userRole,
          status: user.userOrders[0]?.status || "INACTIVE",
          plan: user.userOrders[0]?.plan?.name || "No Plan",
          planInterval:
            user.userOrders[0]?.plan?.interval === "MONTH"
              ? "Monthly"
              : user.userOrders[0]?.plan?.interval === "YEAR"
                ? "Yearly"
                : "",
          joinedDate: user.createdAt,
          lastActiveAt: user.lastActiveAt,
          image: user.image,
        };
      })
      .filter(Boolean); // Remove null entries

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: true, // Default to verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
      },
    });

    // Create default organization and role if role is specified
    if (role) {
      // Create a default organization for the user
      const organization = await prisma.organization.create({
        data: {
          name: `${name}'s Organization`,
          owner_user_id: newUser.id,
        },
      });

      // Create role for the user
      await prisma.role.create({
        data: {
          org_id: organization.id,
          org_name: organization.name,
          user_id: newUser.id,
          email: newUser.email,
          role: role.toLowerCase(),
        },
      });
    }

    // Transform the response
    const transformedUser = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.email.split("@")[0],
      email: newUser.email,
      role: role || "User",
      status: newUser.isVerified ? "Active" : "Inactive",
      joinedDate: newUser.createdAt,
      lastActiveAt: newUser.lastActiveAt,
      image: newUser.image,
    };

    return NextResponse.json(transformedUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
