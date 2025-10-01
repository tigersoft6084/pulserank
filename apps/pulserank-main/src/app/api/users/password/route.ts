import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
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

    const { currentPassword, newPassword } = await req.json();
    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!dbUser) {
      throw new AuthenticationError();
    }

    if (dbUser.password) {
      if (!currentPassword) {
        throw new ValidationError("Current password required");
      }
      const ok = await bcrypt.compare(currentPassword, dbUser.password);
      if (!ok) {
        throw new ValidationError("Current password is incorrect");
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
