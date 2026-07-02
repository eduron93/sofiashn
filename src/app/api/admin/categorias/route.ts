import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { name, description, image, order } = await req.json();
    if (!name?.trim() || name.length > 100) return NextResponse.json({ error: "Nombre inválido (máx 100 caracteres)" }, { status: 400 });
    if (description && description.length > 500) return NextResponse.json({ error: "Descripción muy larga (máx 500)" }, { status: 400 });
    if (order !== undefined && (isNaN(parseInt(order)) || parseInt(order) < 0 || parseInt(order) > 9999)) {
      return NextResponse.json({ error: "Orden inválida (0-9999)" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    const slug = slugify(name);
    const existing = await prisma.category.count({ where: { slug: { startsWith: slug } } });
    const uniqueSlug = existing > 0 ? `${slug}-${existing + 1}` : slug;
    const category = await prisma.category.create({
      data: {
        name: name.trim().substring(0, 100),
        slug: uniqueSlug,
        description: description?.trim().substring(0, 500) || null,
        image: image || null,
        order: order ? parseInt(order) : 0,
        isActive: true,
      },
      include: { _count: { select: { products: true, subcategories: true } } },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 });
    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id, name, description, image, order } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    if (name !== undefined && (name.length > 100 || !name.trim())) return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    if (description && description.length > 500) return NextResponse.json({ error: "Descripción muy larga" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim().substring(0, 500) || null,
        image: image || null,
        order: order !== undefined ? parseInt(order) : undefined,
      },
      include: { _count: { select: { products: true, subcategories: true } } },
    });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Error al actualizar la categoría" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "No se puede eliminar (tiene productos asociados)" }, { status: 400 });
  }
}
