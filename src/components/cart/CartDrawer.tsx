"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCartStore();
  const { requireAuth } = useRequireAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="font-semibold text-lg">
                  Carrito ({itemCount()})
                </h2>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                  <ShoppingBag className="w-16 h-16 opacity-30" />
                  <p className="font-medium text-gray-500">Tu carrito está vacío</p>
                  <Link
                    href="/catalogo"
                    onClick={closeCart}
                    className="text-sm text-gray-900 underline underline-offset-4"
                  >
                    Ver productos
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.color}-${item.size}`} className="p-4 flex gap-4">
                      <div className="relative w-20 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                        {item.color && (
                          <p className="text-xs text-gray-500 mt-0.5">Color: {item.color.split("|")[0]}</p>
                        )}
                        {item.size && (
                          <p className="text-xs text-gray-500">Talla: {item.size}</p>
                        )}
                        <p className="text-sm font-semibold mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                              disabled={item.quantity >= item.stock}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.color, item.size)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span className="text-green-600">Calcular al finalizar</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                </div>

                <button
                  onClick={() => requireAuth(() => { closeCart(); window.location.href = "/checkout"; })}
                  className="block w-full bg-gray-900 text-white text-center py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Finalizar Compra
                </button>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
