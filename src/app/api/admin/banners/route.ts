import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

function isValidInternalLink(url: string | null): boolean {
  if (!url) return true;
  // Solo rutas relativas internas, sin protocolo ni dominios externos
  return url.startsWith("/") && !url.startsWith("//");
}

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { title, subtitle, image, mobileImage, link, buttonText, order, isActive } = await req.json();
    if (!title || !image) return NextResponse.json({ error: "Título e imagen son requeridos" }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "Título muy largo (máx 200)" }, { status: 400 });
    if (!isValidInternalLink(link)) return NextResponse.json({ error: "El link debe ser una ruta interna (ej: /catalogo)" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        image,
        mobileImage: mobileImage || null,
        link: link || null,
        buttonText: buttonText?.trim().substring(0, 50) || null,
        order: order ? parseInt(order) : 0,
        isActive,
      },
    });
    return NextResponse.json({ banner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear el banner" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id, isActive, title, subtitle, image, mobileImage, link, buttonText, order } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (title !== undefined) {
      if (!title || title.length > 200) return NextResponse.json({ error: "Título inválido" }, { status: 400 });
      if (!isValidInternalLink(link ?? null)) return NextResponse.json({ error: "El link debe ser una ruta interna (ej: /catalogo)" }, { status: 400 });
      data.title = title.trim();
      data.subtitle = subtitle?.trim() || null;
      data.image = image;
      data.mobileImage = mobileImage || null;
      data.link = link || null;
      data.buttonText = buttonText?.trim().substring(0, 50) || null;
      data.order = order !== undefined ? parseInt(order) : 0;
    }

    const { prisma } = await import("@/lib/prisma");
    const banner = await prisma.banner.update({ where: { id }, data });
    return NextResponse.json({ banner });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const { prisma } = await import("@/lib/prisma");
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
