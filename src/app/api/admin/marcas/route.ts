import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { name } = await req.json();
    if (!name?.trim() || name.length > 100) {
      return NextResponse.json({ error: "Nombre inválido (máx 100 caracteres)" }, { status: 400 });
    }
    const { prisma } = await import("@/lib/prisma");
    const slug = name.trim()
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const brand = await prisma.brand.create({
      data: { name: name.trim(), slug },
    });
    return NextResponse.json({ brand }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 400 });
    return NextResponse.json({ error: "Error al crear la marca" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.product.count({ where: { brandId: id } });
    if (count > 0) return NextResponse.json({ error: `No se puede eliminar: tiene ${count} producto(s) asociado(s)` }, { status: 400 });
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar la marca" }, { status: 500 });
  }
}
