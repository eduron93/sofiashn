import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export async function DELETE(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.payment.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar el pedido" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "ID y estado requeridos" }, { status: 400 });
    if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, orderNumber: true },
    });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 });
  }
}
