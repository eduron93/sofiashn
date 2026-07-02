import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get("velora-token")?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "velora-jwt-secret");
    const { payload } = await jwtVerify(token, secret);
    return (payload as any).id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Debes iniciar sesión para dejar una reseña" }, { status: 401 });

  const { id: productId } = await params;
  const { rating, title, body } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "La calificación debe ser entre 1 y 5" }, { status: 400 });
  }
  if (title && title.length > 100) {
    return NextResponse.json({ error: "El título no puede superar 100 caracteres" }, { status: 400 });
  }
  if (body && body.length > 1000) {
    return NextResponse.json({ error: "La reseña no puede superar 1000 caracteres" }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) return NextResponse.json({ error: "Ya dejaste una reseña para este producto" }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating),
        title: title?.trim().substring(0, 100) || null,
        body: body?.trim().substring(0, 1000) || null,
        isApproved: true,
      },
    });

    // Recalcular rating y conteo del producto
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    });

    return NextResponse.json({ review, message: "¡Gracias por tu reseña!" }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya dejaste una reseña para este producto" }, { status: 400 });
    return NextResponse.json({ error: "Error al guardar la reseña" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  try {
    const { prisma } = await import("@/lib/prisma");
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}
