import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json({ error: "Código de cupón requerido" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Este cupón no está activo" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json({ error: "Este cupón aún no está disponible" }, { status: 400 });
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ error: "Este cupón ha expirado" }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Este cupón ha alcanzado su límite de usos" }, { status: 400 });
    }

    const sub = parseFloat(subtotal) || 0;
    if (coupon.minPurchase !== null && sub < coupon.minPurchase) {
      return NextResponse.json({
        error: `Compra mínima de L ${coupon.minPurchase.toFixed(2)} requerida`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (sub * coupon.value) / 100;
      if (coupon.maxDiscount !== null) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === "FIXED") {
      discount = Math.min(coupon.value, sub);
    } else if (coupon.type === "FREE_SHIPPING") {
      discount = 0; // handled on client
    }

    discount = Math.round(discount * 100) / 100;

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
      },
      discount,
    });
  } catch {
    return NextResponse.json({ error: "Error al validar el cupón" }, { status: 500 });
  }
}
