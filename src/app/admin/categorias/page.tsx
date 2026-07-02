export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { CategoriasClient } from "./CategoriasClient";

export const metadata: Metadata = { title: "Categorías" };

async function getCategories() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.category.findMany({
      include: { _count: { select: { products: true, subcategories: true } } },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminCategoriasPage() {
  const categories = await getCategories();
  return <CategoriasClient categories={categories as any[]} />;
}
