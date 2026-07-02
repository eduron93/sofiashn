import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!raw) return NextResponse.json({ error: "Número de pedido requerido" }, { status: 400 });

  // Normalizar: quitar espacios internos, convertir a mayúsculas
  const q = raw.replace(/\s+/g, "").toUpperCase();

  try {
    const { prisma } = await import("@/lib/prisma");

    // Buscar por orderNumber exacto, o por id (por si el usuario copia el id)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: q },
          { id: raw },           // ids son case-sensitive, usar raw
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        subtotal: true,
        shipping: true,
        createdAt: true,
        shippingAddress: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            size: true,
            color: true,
            product: { select: { name: true, images: true } },
          },
        },
      },
    });

    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    console.error("track error:", e);
    return NextResponse.json({ error: "Error al buscar el pedido" }, { status: 500 });
  }
}
