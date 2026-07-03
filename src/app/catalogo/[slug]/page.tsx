import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const categoryNames: Record<string, string> = {
  mujeres: "Mujeres",
  hombres: "Hombres",
  ninos: "Niños",
  calzado: "Calzado",
  accesorios: "Accesorios",
  hogar: "Hogar",
  ofertas: "Ofertas",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = categoryNames[slug] || slug;
  return {
    title: name,
    description: `Explora la colección ${name} en SOFIAS HN. Moda premium con los mejores precios.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolved = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
      <CatalogClient searchParams={{ ...resolved, category: slug === "ofertas" ? "" : slug }} />
    </Suspense>
  );
}
