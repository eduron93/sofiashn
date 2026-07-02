"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_INFO: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: "Pendiente",   color: "text-yellow-600", icon: <Clock className="w-5 h-5" /> },
  CONFIRMED:  { label: "Confirmado",  color: "text-blue-600",   icon: <CheckCircle className="w-5 h-5" /> },
  PROCESSING: { label: "En proceso",  color: "text-purple-600", icon: <Package className="w-5 h-5" /> },
  SHIPPED:    { label: "Enviado",     color: "text-indigo-600", icon: <Truck className="w-5 h-5" /> },
  DELIVERED:  { label: "Entregado",   color: "text-green-600",  icon: <CheckCircle className="w-5 h-5" /> },
  CANCELLED:  { label: "Cancelado",   color: "text-red-600",    icon: <XCircle className="w-5 h-5" /> },
};

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  product: { name: string; images: string[] };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  createdAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
  } | null;
  items: OrderItem[];
}

export default function RastrearPage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        setError("No encontramos ningún pedido con ese número. Verifica e intenta de nuevo.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Error al buscar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Rastrear Pedido</h1>
          <p className="mt-2 text-gray-500 text-sm">Ingresa tu número de pedido para ver el estado</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Número de pedido
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: VEL-1234567"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Buscar
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}
        </form>

        {/* Order result */}
        {order && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Pedido</p>
                  <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("es-HN", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                {STATUS_INFO[order.status] && (
                  <div className={`flex items-center gap-1.5 font-semibold text-sm ${STATUS_INFO[order.status].color}`}>
                    {STATUS_INFO[order.status].icon}
                    {STATUS_INFO[order.status].label}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {!isCancelled && (
                <div className="mt-6">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-4 h-1 bg-gray-100 -z-0">
                      <div
                        className="h-full bg-gray-900 transition-all duration-500"
                        style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }}
                      />
                    </div>
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center gap-1 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                            {i + 1}
                          </div>
                          <span className={`text-xs mt-1 text-center w-14 leading-tight ${done ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                            {STATUS_INFO[step]?.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="mt-4 bg-red-50 rounded-xl px-4 py-3 text-sm text-red-700">
                  Este pedido fue cancelado.
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Productos</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[item.color ? item.color.split("|")[0] : null, item.size]
                          .filter(Boolean).join(" · ")}
                        {" "}× {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      L. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>L. {order.subtotal?.toFixed(2) ?? order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Envío</span>
                  <span>{order.shipping === 0 ? "Gratis" : `L. ${order.shipping?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                  <span>Total</span><span>L. {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Dirección de entrega</h3>
                <p className="text-sm text-gray-700">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              </div>
            )}
          </div>
        )}

        {!order && !loading && !error && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Tu número de pedido lo encuentras en el correo de confirmación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
