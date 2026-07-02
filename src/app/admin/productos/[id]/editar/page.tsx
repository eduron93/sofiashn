export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { EditarProductoForm } from "./EditarProductoForm";

async function getData(id: string) {
  const { prisma } = await import("@/lib/prisma");
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true, name: true, description: true, features: true, price: true, comparePrice: true,
        stock: true, sku: true, categoryId: true, brandId: true,
        sizes: true, colors: true, images: true, isActive: true, isFeatured: true,
        isNew: true, isBestSeller: true,
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { product, categories, brands };
}

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, categories, brands } = await getData(id);
  if (!product) notFound();
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Editar Producto</h1>
      <EditarProductoForm product={product} categories={categories} brands={brands} />
    </div>
  );
}
