"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag, Heart, Share2, Star, Truck, Shield, RefreshCw, Minus, Plus, ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import { ProductSection } from "@/components/home/ProductSection";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Product } from "@/types";

interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  createdAt: Date | string;
  user: { name?: string | null; image?: string | null };
}

interface ProductDetailProps {
  product: Product & { reviews?: ReviewItem[] };
  related: Product[];
}

export function ProductDetail({ product, related }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"desc" | "features" | "reviews">("desc");
  const [zoom, setZoom] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>(product.reviews ?? []);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating ?? 0;

  const submitReview = useCallback(async () => {
    if (!reviewRating) { setReviewError("Selecciona una calificación"); return; }
    setReviewLoading(true);
    setReviewError("");
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, title: reviewTitle, body: reviewBody }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.error ?? "Error al enviar reseña"); return; }
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewTitle("");
      setReviewBody("");
      // Agregar la nueva reseña a la lista local inmediatamente
      if (data.review) {
        setReviews((prev) => [{ ...data.review, user: { name: "Tú", image: null } }, ...prev]);
      }
    } catch {
      setReviewError("Error de conexión. Intenta de nuevo.");
    } finally {
      setReviewLoading(false);
    }
  }, [product.id, reviewRating, reviewTitle, reviewBody]);

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();
  const { requireAuth } = useRequireAuth();
  const fav = isFavorite(product.id);
  const discount = calculateDiscount(product.price, product.comparePrice ?? 0);

  const handleAddToCart = () => {
    if (product.colors.length > 0 && !selectedColor) {
      toast("Por favor selecciona un color", "error");
      return;
    }
    if (product.sizes.length > 0 && !selectedSize) {
      toast("Por favor selecciona una talla", "error");
      return;
    }
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.price,
      quantity,
      color: selectedColor,
      size: selectedSize,
      stock: product.stock,
    });
    toast(`"${product.name}" agregado al carrito`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast("Enlace copiado al portapapeles", "info");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600">Inicio</Link>
        <ChevronRight className="w-4 h-4" />
        {product.category && (
          <>
            <Link href={`/catalogo/${product.category.slug}`} className="hover:text-gray-600">
              {product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="hidden sm:flex flex-col gap-2 w-20">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-colors",
                    selectedImage === i ? "border-gray-900" : "border-transparent hover:border-gray-300"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} width={80} height={80} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1">
            <div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
              onClick={() => setZoom(!zoom)}
            >
              <Image
                src={product.images[selectedImage] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"}
                alt={product.name}
                fill
                className={cn("object-cover transition-transform duration-500", zoom && "scale-150")}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Mobile thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 sm:hidden">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors",
                      selectedImage === i ? "border-gray-900" : "border-transparent"
                    )}
                  >
                    <Image src={img} alt={`${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-6">
          {product.brand && (
            <p className="text-sm text-gray-400 uppercase tracking-widest">{product.brand.name}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {/* Rating */}
          {(avgRating > 0 || reviews.length > 0) && (
            <button
              onClick={() => setTab("reviews")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("w-4 h-4", s <= Math.round(avgRating) ? "text-amber-400 fill-current" : "text-gray-200 fill-current")} />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {avgRating > 0 ? avgRating.toFixed(1) : ""}{" "}
                ({reviews.length} reseña{reviews.length !== 1 ? "s" : ""})
              </span>
            </button>
          )}

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                <span className="bg-rose-50 text-rose-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                  Ahorras {formatPrice(product.comparePrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <p className={cn("text-sm font-medium", product.stock > 0 ? "text-green-600" : "text-red-500")}>
            {product.stock > 10
              ? "✓ En stock"
              : product.stock > 0
              ? `⚠ Solo quedan ${product.stock} unidades`
              : "✗ Agotado"}
          </p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color:{" "}
                <span className="font-normal text-gray-500">
                  {selectedColor ? selectedColor.split("|")[0] : "Seleccionar"}
                </span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => {
                  const [name, hex] = color.includes("|") ? color.split("|") : [color, color];
                  return (
                    <div key={color} className="relative group">
                      <button
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "w-9 h-9 rounded-full border-2 transition-all",
                          selectedColor === color
                            ? "border-gray-900 scale-110 shadow-md"
                            : "border-gray-200 hover:border-gray-500"
                        )}
                        style={{ backgroundColor: hex }}
                      />
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">
                  Talla: <span className="font-normal text-gray-500">{selectedSize || "Seleccionar"}</span>
                </p>
                <button className="text-xs text-gray-400 underline hover:text-gray-600">Guía de tallas</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[44px] h-10 px-3 rounded-lg border text-sm font-medium transition-all",
                      selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Cantidad</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-400">{product.stock} disponibles</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300"
            >
              <ShoppingBag className="w-5 h-5" />
              {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
            </button>
            <button
              onClick={() => toggle(product.id)}
              className={cn(
                "w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all",
                fav ? "border-rose-500 bg-rose-50 text-rose-500" : "border-gray-200 text-gray-500 hover:border-gray-400"
              )}
            >
              <Heart className={cn("w-5 h-5", fav && "fill-current")} />
            </button>
            <button
              onClick={handleShare}
              className="w-14 h-14 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Buy now */}
          {product.stock > 0 && (
            <button
              onClick={() => requireAuth(() => { handleAddToCart(); window.location.href = "/checkout"; })}
              className="block w-full text-center bg-white border-2 border-gray-900 text-gray-900 py-4 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Comprar Ahora
            </button>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {[
              { icon: Truck, text: "Envío en 2-5 días" },
              { icon: Shield, text: "Pago 100% seguro" },
              { icon: RefreshCw, text: "30 días de garantía" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center text-center gap-2">
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex border-b border-gray-200 gap-8">
          <button
            onClick={() => setTab("desc")}
            className={cn("pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "desc" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Descripción
          </button>
          {product.features?.length > 0 && (
            <button
              onClick={() => setTab("features")}
              className={cn("pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === "features" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700")}
            >
              Características ({product.features.length})
            </button>
          )}
          <button
            onClick={() => setTab("reviews")}
            className={cn("pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "reviews" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Reseñas ({reviews.length})
          </button>
        </div>

        <div className="py-8">
          {tab === "desc" && (
            <div className="max-w-2xl">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              {product.features?.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Características</p>
                  <ul className="space-y-2">
                    {product.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tab === "features" && (
            <ul className="space-y-3 max-w-lg">
              {product.features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}
          {tab === "reviews" && (
            <div className="max-w-2xl space-y-8">
              {/* Resumen de calificación */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                    <div className="flex justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn("w-4 h-4", s <= Math.round(avgRating) ? "text-amber-400 fill-current" : "text-gray-200 fill-current")} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-4 text-right">{star}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lista de reseñas */}
              <div className="space-y-5">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {review.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.user.name || "Cliente"}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "text-amber-400 fill-current" : "text-gray-200 fill-current")} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.title && <p className="font-semibold text-sm mb-1 text-gray-900">{review.title}</p>}
                    {review.body && <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>}
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm">No hay reseñas aún. ¡Sé el primero en opinar!</p>
                )}
              </div>

              {/* Formulario para escribir reseña */}
              <div className="border-t pt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Deja tu reseña</h3>
                {reviewSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                    ¡Gracias por tu reseña! Ya está publicada.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Estrellas interactivas */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Calificación *</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            onMouseEnter={() => setReviewHover(s)}
                            onMouseLeave={() => setReviewHover(0)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star className={cn("w-7 h-7 transition-colors",
                              s <= (reviewHover || reviewRating)
                                ? "text-amber-400 fill-current"
                                : "text-gray-200 fill-current"
                            )} />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm text-gray-500 self-center">
                            {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][reviewRating]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Título (opcional)</label>
                      <input
                        type="text"
                        maxLength={100}
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Resumen de tu experiencia"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Reseña (opcional)</label>
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Cuéntanos tu experiencia con el producto..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">{reviewBody.length}/1000</p>
                    </div>

                    {reviewError && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{reviewError}</p>
                    )}

                    <button
                      onClick={submitReview}
                      disabled={reviewLoading || !reviewRating}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {reviewLoading ? "Enviando..." : "Enviar reseña"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <ProductSection
          title="Productos Relacionados"
          subtitle="También te puede gustar"
          products={related}
          href={`/catalogo/${product.category?.slug || ""}`}
          linkLabel="Ver más"
        />
      )}
    </div>
  );
}
