"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count: { products: number };
}

const FALLBACK_IMAGES: Record<string, string> = {
  mujeres: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
  hombres: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
  ninos: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
  calzado: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  accesorios: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  hogar: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80";

export function CategoryGridClient({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Compra por Categoría</h2>
        <p className="mt-2 text-gray-500">Encuentra exactamente lo que buscas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => {
          const image = cat.image || FALLBACK_IMAGES[cat.slug] || DEFAULT_FALLBACK;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/catalogo/${cat.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-100">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-white">
                    <p className="font-bold text-base">{cat.name}</p>
                    <p className="text-xs text-white/70 mt-0.5">{cat._count.products} productos</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
