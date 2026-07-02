import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { code, description, type, value, minPurchase, usageLimit, expiresAt, isActive } = await req.json();

    if (!code?.trim() || code.length > 50) return NextResponse.json({ error: "Código inválido (máx 50 caracteres)" }, { status: 400 });
    if (!["PERCENTAGE", "FIXED"].includes(type)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    if (type === "PERCENTAGE" && numValue > 100) return NextResponse.json({ error: "El porcentaje no puede exceder 100%" }, { status: 400 });
    if (description && description.length > 500) return NextResponse.json({ error: "Descripción muy larga (máx 500)" }, { status: 400 });
    if (minPurchase && parseFloat(minPurchase) < 0) return NextResponse.json({ error: "Compra mínima no puede ser negativa" }, { status: 400 });
    if (usageLimit && (parseInt(usageLimit) < 0 || parseInt(usageLimit) > 999999)) return NextResponse.json({ error: "Límite de usos inválido" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description?.trim().substring(0, 500) || null,
        type,
        value: numValue,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: !!isActive,
      },
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe un cupón con ese código" }, { status: 400 });
    return NextResponse.json({ error: "Error al crear el cupón" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    // Toggle rápido (solo isActive)
    if (Object.keys(body).length === 2 && typeof body.isActive === "boolean") {
      const { prisma } = await import("@/lib/prisma");
      const coupon = await prisma.coupon.update({ where: { id }, data: { isActive: body.isActive } });
      return NextResponse.json({ coupon });
    }

    // Edición completa
    const { code, description, type, value, minPurchase, usageLimit, expiresAt, isActive } = body;
    if (!code?.trim() || code.length > 50) return NextResponse.json({ error: "Código inválido (máx 50 caracteres)" }, { status: 400 });
    if (!["PERCENTAGE", "FIXED"].includes(type)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    if (type === "PERCENTAGE" && numValue > 100) return NextResponse.json({ error: "El porcentaje no puede exceder 100%" }, { status: 400 });
    if (description && description.length > 500) return NextResponse.json({ error: "Descripción muy larga (máx 500)" }, { status: 400 });
    if (minPurchase && parseFloat(minPurchase) < 0) return NextResponse.json({ error: "Compra mínima no puede ser negativa" }, { status: 400 });
    if (usageLimit && (parseInt(usageLimit) < 0 || parseInt(usageLimit) > 999999)) return NextResponse.json({ error: "Límite de usos inválido" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.trim().toUpperCase(),
        description: description?.trim().substring(0, 500) || null,
        type,
        value: numValue,
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: !!isActive,
      },
    });
    return NextResponse.json({ coupon });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe un cupón con ese código" }, { status: 400 });
    return NextResponse.json({ error: "Error al actualizar el cupón" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
