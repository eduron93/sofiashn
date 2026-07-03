export const dynamic = "force-dynamic";

import { HeroSlider } from "@/components/home/HeroSlider";
import { BenefitsBar } from "@/components/home/BenefitsBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSection } from "@/components/home/ProductSection";
import { CountdownBanner } from "@/components/home/CountdownBanner";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import type { Product } from "@/types";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function getStoreName(): string {
  try {
    const path = join(process.cwd(), "store-config.json");
    if (!existsSync(path)) return "nuestra tienda";
    const cfg = JSON.parse(readFileSync(path, "utf-8"));
    return cfg.store_name || "nuestra tienda";
  } catch {
    return "nuestra tienda";
  }
}

async function getBanners() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.banner.findMany({
      where: { isActive: true },
      select: { id: true, title: true, subtitle: true, image: true, link: true, buttonText: true },
      orderBy: { order: "asc" },
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, image: true, _count: { select: { products: true } } },
      orderBy: { order: "asc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

async function getHomeProducts() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const [featured, newArrivals, bestSellers, onSale] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        include: { category: true, brand: true },
        orderBy: { salesCount: "desc" },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isNew: true, isActive: true },
        include: { category: true, brand: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isBestSeller: true, isActive: true },
        include: { category: true, brand: true },
        orderBy: { salesCount: "desc" },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isActive: true, NOT: { comparePrice: null } },
        include: { category: true, brand: true },
        orderBy: { salesCount: "desc" },
        take: 10,
      }),
    ]);
    return { featured, newArrivals, bestSellers, onSale };
  } catch {
    return { featured: [], newArrivals: [], bestSellers: [], onSale: [] };
  }
}

export default async function HomePage() {
  const storeName = getStoreName();
  const [{ featured, newArrivals, bestSellers, onSale }, categories, banners] = await Promise.all([
    getHomeProducts(),
    getCategories(),
    getBanners(),
  ]);

  const toProduct = (p: any): Product => ({
    ...p,
    comparePrice: p.comparePrice ?? null,
    subcategoryId: p.subcategoryId ?? null,
    brandId: p.brandId ?? null,
  });

  return (
    <>
      <HeroSlider initialSlides={banners} />
      <BenefitsBar />
      <CategoryGrid categories={categories as any[]} />

      {featured.length > 0 && (
        <ProductSection
          title="Productos Destacados"
          subtitle="Selección especial de nuestros mejores artículos"
          products={featured.map(toProduct)}
          href="/catalogo"
          linkLabel="Ver todo el catálogo"
        />
      )}

      <CountdownBanner />

      {newArrivals.length > 0 && (
        <ProductSection
          title="Recién Llegados"
          subtitle="Las últimas tendencias acaban de llegar"
          products={newArrivals.map(toProduct)}
          href="/catalogo?filter=new"
          linkLabel="Ver todos los nuevos"
        />
      )}

      {bestSellers.length > 0 && (
        <ProductSection
          title="Los Más Vendidos"
          subtitle="Lo que eligen nuestros clientes"
          products={bestSellers.map(toProduct)}
          href="/catalogo?filter=bestseller"
        />
      )}

      {onSale.length > 0 && (
        <ProductSection
          title="Ofertas Especiales"
          subtitle="Precios increíbles por tiempo limitado"
          products={onSale.map(toProduct)}
          href="/catalogo/ofertas"
          linkLabel="Ver todas las ofertas"
        />
      )}

      <TestimonialsSection />
      <NewsletterSection storeName={storeName} />
    </>
  );
}
