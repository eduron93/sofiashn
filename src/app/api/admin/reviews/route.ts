import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { prisma } = await import("@/lib/prisma");
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id, isApproved } = await req.json();
    if (!id || typeof isApproved !== "boolean") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    const review = await prisma.review.update({ where: { id }, data: { isApproved } });

    // Recalcular rating del producto
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "Error al actualizar reseña" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    const review = await prisma.review.delete({ where: { id } });

    // Recalcular rating del producto
    const stats = await prisma.review.aggregate({
      where: { productId: review.productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar reseña" }, { status: 500 });
  }
}
