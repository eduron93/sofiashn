import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora toda la colección VELORA. Moda para mujeres, hombres, niños, calzado, accesorios y hogar.",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const resolved = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
      <CatalogClient searchParams={resolved} />
    </Suspense>
  );
}
