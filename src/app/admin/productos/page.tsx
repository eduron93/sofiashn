export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ProductosClient } from "./ProductosClient";

export const metadata: Metadata = { title: "Productos" };

async function getProducts() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.findMany({
      select: {
        id: true, name: true, slug: true, sku: true,
        price: true, comparePrice: true, stock: true,
        images: true, isActive: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductosClient products={products as any[]} />;
}
