import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  if (!slug) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        brand: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

async function getRelated(categoryId: string, excludeId: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.product.findMany({
      where: { categoryId, isActive: true, NOT: { id: excludeId } },
      include: { category: true, brand: true },
      take: 6,
      orderBy: { salesCount: "desc" },
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description || `Compra ${product.name} en SOFIAS HN`,
    openGraph: { images: product.images[0] ? [{ url: product.images[0] }] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelated(product.categoryId, product.id);

  return <ProductDetail product={product as any} related={related as any[]} />;
}
