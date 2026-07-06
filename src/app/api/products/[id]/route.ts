import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { deleteStorageImages } from "@/lib/supabase-storage";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const { prisma } = await import("@/lib/prisma");

    // Detectar imágenes eliminadas para borrarlas de Storage
    if (Array.isArray(body.images)) {
      const current = await prisma.product.findUnique({ where: { id }, select: { images: true } });
      const removed = (current?.images ?? []).filter((img: string) => !body.images.includes(img));
      if (removed.length > 0) deleteStorageImages(removed).catch(() => {});
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        features: Array.isArray(body.features) ? body.features : [],
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        stock: parseInt(body.stock),
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        isNew: body.isNew,
        isBestSeller: body.isBestSeller,
        ...(Array.isArray(body.sizes) ? { sizes: body.sizes } : {}),
        ...(Array.isArray(body.colors) ? { colors: body.colors } : {}),
        ...(Array.isArray(body.images) ? { images: body.images } : {}),
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { prisma } = await import("@/lib/prisma");

    // Obtener imágenes antes de eliminar para borrarlas de Storage
    const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });

    // Eliminar relaciones antes de borrar el producto
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.favorite.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.inventory.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    // Borrar imágenes de Supabase Storage (en background)
    if (product?.images?.length) deleteStorageImages(product.images).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE product:", e);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
