"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();
  const fav = mounted && isFavorite(product.id);

  useEffect(() => { setMounted(true); }, []);

  const discount = calculateDiscount(product.price, product.comparePrice ?? 0);
  const image = product.images?.[imgIndex] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
    toast(`"${product.name}" agregado al carrito`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast(fav ? "Eliminado de favoritos" : "Agregado a favoritos", fav ? "info" : "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden"
    >
      <Link href={`/producto/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Nuevo
              </span>
            )}
            {discount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Best Seller
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
            hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <button
              onClick={handleFavorite}
              className={cn(
                "w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-colors",
                fav ? "text-rose-500" : "text-gray-600 hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-4 h-4", fav && "fill-current")} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/producto/${product.slug}`); }}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick add to cart + low stock (juntos para no cortarse) */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 transition-all duration-300",
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          )}>
            {product.stock > 0 && product.stock <= 5 && (
              <div className="bg-amber-400 text-white text-[10px] text-center py-1 font-semibold tracking-wide">
                ¡Solo quedan {product.stock}!
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-gray-900 text-white py-3 text-xs font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
            </button>
          </div>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {product.brand && (
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              {product.brand.name}
            </p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3 h-3",
                      star <= Math.round(product.rating)
                        ? "text-amber-400 fill-current"
                        : "text-gray-200 fill-current"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Low stock badge */}
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">¡Solo quedan {product.stock}!</p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-semibold text-gray-900 text-sm">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex gap-1 mt-2">
              {product.colors.slice(0, 5).map((color) => {
                const [name, hex] = color.includes("|") ? color.split("|") : [color, color];
                return (
                <div
                  key={color}
                  title={name}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                );
              })}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-gray-400">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
