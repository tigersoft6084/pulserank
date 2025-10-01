import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  AuthenticationError,
  ValidationError,
} from "@/lib/utils/error-handler";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const { name, email } = await req.json();

    if (name && typeof name !== "string") {
      throw new ValidationError("Invalid name");
    }
    if (email && typeof email !== "string") {
      throw new ValidationError("Invalid email");
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
