"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
  linkLabel?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  href,
  linkLabel = "Ver todo",
}: ProductSectionProps) {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:gap-2 transition-all group"
          >
            {linkLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {products.slice(0, 10).map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}
