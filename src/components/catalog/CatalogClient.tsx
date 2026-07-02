"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, Grid3x3, LayoutList } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

const sortOptions = [
  { label: "Más Relevantes", value: "relevance" },
  { label: "Precio: Menor a Mayor", value: "price_asc" },
  { label: "Precio: Mayor a Menor", value: "price_desc" },
  { label: "Más Nuevos", value: "newest" },
  { label: "Más Vendidos", value: "bestseller" },
  { label: "Mayor Descuento", value: "discount" },
  { label: "Mejor Calificados", value: "rating" },
];

export function CatalogClient({ searchParams }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([
    { label: "Todos", value: "" },
  ]);

  const category = (searchParams.category as string) || "";
  const sort = (searchParams.sort as string) || "relevance";
  const page = parseInt((searchParams.page as string) || "1");
  const minPrice = (searchParams.minPrice as string) || "";
  const maxPrice = (searchParams.maxPrice as string) || "";
  const search = (searchParams.search as string) || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (category) query.set("category", category);
      if (sort) query.set("sort", sort);
      if (page) query.set("page", String(page));
      if (minPrice) query.set("minPrice", minPrice);
      if (maxPrice) query.set("maxPrice", maxPrice);
      if (search) query.set("search", search);

      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      // silencioso — productos quedan vacíos
    } finally {
      setLoading(false);
    }
  }, [category, sort, page, minPrice, maxPrice, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) {
          setCategoryOptions([
            { label: "Todos", value: "" },
            ...data.categories.map((c: { name: string; slug: string }) => ({
              label: c.name,
              value: c.slug,
            })),
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const updateParam = (key: string, value: string) => {
    const current = new URLSearchParams();
    // Preservar todos los filtros activos desde el estado actual
    if (category) current.set("category", category);
    if (sort && sort !== "relevance") current.set("sort", sort);
    if (minPrice) current.set("minPrice", minPrice);
    if (maxPrice) current.set("maxPrice", maxPrice);
    if (search) current.set("search", search);
    current.set("page", String(page));
    // Aplicar el cambio solicitado
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    // Al cambiar cualquier filtro que no sea página, volver a página 1
    if (key !== "page") current.set("page", "1");
    router.push(`/catalogo?${current.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-gray-50 border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {category
              ? (categoryOptions.find((c) => c.value === category)?.label || category)
              : "Todo el Catálogo"}
          </h1>
          {search && (
            <p className="text-gray-500 mt-1 text-sm">
              Resultados para: <strong>"{search}"</strong>
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Buscando..." : `${total} productos encontrados`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParam("category", opt.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  category === opt.value
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filters button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-gray-900 text-white" : "hover:bg-gray-50")}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-2 transition-colors", viewMode === "list" ? "bg-gray-900 text-white" : "hover:bg-gray-50")}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Precio Mínimo
                  </label>
                  <input
                    type="number"
                    placeholder="L. 0"
                    value={minPrice}
                    onChange={(e) => updateParam("minPrice", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Precio Máximo
                  </label>
                  <input
                    type="number"
                    placeholder="L. 9999"
                    value={maxPrice}
                    onChange={(e) => updateParam("maxPrice", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const current = new URLSearchParams();
                      router.push(`/catalogo?${current.toString()}`);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[3/4] shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-3 shimmer rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold text-gray-400">No se encontraron productos</p>
            <p className="text-gray-400 mt-2 text-sm">Intenta ajustar tus filtros</p>
            <button
              onClick={() => router.push("/catalogo")}
              className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1 sm:grid-cols-2"
            )}>
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 6} />
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (() => {
              const totalPages = Math.ceil(total / 20);
              const delta = 2;
              const pages: (number | "...")[] = [];
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                  pages.push(i);
                } else if (pages[pages.length - 1] !== "...") {
                  pages.push("...");
                }
              }
              return (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  <button
                    onClick={() => updateParam("page", String(page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  {pages.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => updateParam("page", String(p))}
                        className={cn(
                          "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                          page === p
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => updateParam("page", String(page + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
