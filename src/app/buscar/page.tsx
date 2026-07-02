import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Búsqueda: "${q}"` : "Buscar productos",
    description: `Resultados de búsqueda para "${q}" en VELORA`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const params = { ...resolved, search: resolved.q as string };
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 animate-pulse" />}>
      <CatalogClient searchParams={params} />
    </Suspense>
  );
}
