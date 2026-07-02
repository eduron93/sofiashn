import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
    if (ids.length === 0) return NextResponse.json({ products: [] });

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { category: true, brand: true },
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
