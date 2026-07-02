export const dynamic = "force-dynamic";

import { MarcasClient } from "./MarcasClient";

async function getBrands() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.brand.findMany({
      select: {
        id: true, name: true, slug: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function MarcasPage() {
  const brands = await getBrands();
  return <MarcasClient brands={brands as any[]} />;
}
