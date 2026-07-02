import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("velora-token")?.value;
    if (!token) return NextResponse.json({ orders: [] });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "velora-jwt-secret") as { id: string };
    const { prisma } = await import("@/lib/prisma");

    const orders = await prisma.order.findMany({
      where: { userId: payload.id },
      include: {
        items: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
