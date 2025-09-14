// api handler GET which returns plans from database

import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET() {
  const plans = await prisma.plan.findMany({
    where: {
      active: true,
    },
    orderBy: {
      price: "asc",
    },
  });
  return NextResponse.json(plans);
}
