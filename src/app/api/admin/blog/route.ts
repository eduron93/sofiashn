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
    const { title, excerpt, content, image, category, tags, isPublished } = await req.json();
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Título y contenido son requeridos" }, { status: 400 });
    }
    if (title.length > 200) return NextResponse.json({ error: "Título muy largo (máx 200)" }, { status: 400 });
    if (content.length > 100000) return NextResponse.json({ error: "Contenido muy largo" }, { status: 400 });
    if (excerpt && excerpt.length > 500) return NextResponse.json({ error: "Resumen muy largo (máx 500)" }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const baseSlug = slugify(title);
    const existing = await prisma.post.count({ where: { slug: { startsWith: baseSlug } } });
    const slug = existing > 0 ? `${baseSlug}-${existing + 1}` : baseSlug;
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        image: image || null,
        category: category?.trim().substring(0, 100) || null,
        tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean).slice(0, 20) : [],
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear el post" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id, title, excerpt, content, image, category, tags, isPublished } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (title !== undefined) {
      if (title.length > 200) return NextResponse.json({ error: "Título muy largo" }, { status: 400 });
      data.title = title.trim();
    }
    if (excerpt !== undefined) data.excerpt = excerpt?.trim().substring(0, 500) || null;
    if (content !== undefined) {
      if (content.length > 100000) return NextResponse.json({ error: "Contenido muy largo" }, { status: 400 });
      data.content = content.trim();
    }
    if (image !== undefined) data.image = image || null;
    if (category !== undefined) data.category = category?.trim().substring(0, 100) || null;
    if (tags !== undefined) data.tags = tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean).slice(0, 20) : [];
    if (typeof isPublished === "boolean") {
      data.isPublished = isPublished;
      data.publishedAt = isPublished ? new Date() : null;
    }

    const { prisma } = await import("@/lib/prisma");
    const post = await prisma.post.update({ where: { id }, data });
    return NextResponse.json({ post });
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
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
