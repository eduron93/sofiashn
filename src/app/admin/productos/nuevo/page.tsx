export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { NuevoProductoForm } from "./NuevoProductoForm";

export const metadata: Metadata = { title: "Nuevo Producto" };

async function getData() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ]);
    return { categories, brands };
  } catch {
    return { categories: [], brands: [] };
  }
}

export default async function NuevoProductoPage() {
  const { categories, brands } = await getData();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <a href="/admin/productos" className="hover:text-gray-600 transition-colors">Productos</a>
          <span>/</span>
          <span className="text-gray-900">Nuevo</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
      </div>
      <NuevoProductoForm categories={categories as any[]} brands={brands as any[]} />
    </div>
  );
}
