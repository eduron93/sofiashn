"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Package, MapPin, Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "PENDING",    label: "Pendiente",    color: "bg-yellow-100 text-yellow-700" },
  { value: "CONFIRMED",  label: "Confirmado",   color: "bg-blue-100 text-blue-700" },
  { value: "PROCESSING", label: "En proceso",   color: "bg-purple-100 text-purple-700" },
  { value: "SHIPPED",    label: "Enviado",      color: "bg-indigo-100 text-indigo-700" },
  { value: "DELIVERED",  label: "Entregado",    color: "bg-green-100 text-green-700" },
  { value: "CANCELLED",  label: "Cancelado",    color: "bg-red-100 text-red-700" },
  { value: "REFUNDED",   label: "Reembolsado",  color: "bg-gray-100 text-gray-700" },
];

const statusMap = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

interface OrderItem {
  id: string; name: string; image: string | null;
  quantity: number; price: number; subtotal: number;
  color: string | null; size: string | null;
}
interface Address {
  name: string; phone: string; street: string;
  city: string; state: string; zipCode: string; country: string;
}
interface Order {
  id: string; orderNumber: string; total: number; subtotal: number;
  discount: number; shipping: number; status: string; createdAt: string;
  user: { name: string | null; email: string } | null;
  address: Address | null;
  shippingAddress: Address | null;
  items: OrderItem[];
}

export function PedidosClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initial);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o => {
      const statusLabel = (statusMap[o.status]?.label ?? o.status).toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.user?.name ?? "").toLowerCase().includes(q) ||
        (o.user?.email ?? "").toLowerCase().includes(q) ||
        statusLabel.includes(q)
      );
    });
  }, [orders, search]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length !== orders.length
              ? `${filtered.length} de ${orders.length} pedidos`
              : `${orders.length} pedidos`}
          </p>
        </div>
        <div className="sm:ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número, cliente..."
            className="pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white w-72"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {search ? `No se encontraron pedidos con "${search}"` : "No hay pedidos registrados"}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-gray-500 underline">Limpiar búsqueda</button>
            )}
          </div>
        )}

        {filtered.map((order) => {
          const isOpen = expanded.has(order.id);
          const statusInfo = statusMap[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
          const isUpdating = updating === order.id;

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Fila principal */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Número — clickeable para expandir */}
                <button onClick={() => toggle(order.id)} className="text-xs font-mono text-gray-500 w-36 flex-shrink-0 text-left hover:text-gray-900 transition-colors">
                  {order.orderNumber}
                </button>

                {/* Cliente */}
                <button onClick={() => toggle(order.id)} className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name ?? "Invitado"}</p>
                  <p className="text-xs text-gray-400 truncate">{order.user?.email ?? ""}</p>
                </button>

                {/* Productos count */}
                <span className="text-xs text-gray-400 w-24 flex-shrink-0 hidden sm:block">
                  {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                </span>

                {/* Total */}
                <span className="text-sm font-semibold text-gray-900 w-24 flex-shrink-0 text-right">
                  L {order.total.toFixed(2)}
                </span>

                {/* Selector de estado */}
                <div className="flex-shrink-0 w-36">
                  <select
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-60 ${statusInfo.color}`}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <span className="text-xs text-gray-400 w-24 flex-shrink-0 text-right hidden md:block">
                  {new Date(order.createdAt).toLocaleDateString("es-HN")}
                </span>

                {/* Expandir */}
                <button onClick={() => toggle(order.id)} className="text-gray-400 flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Detalle expandible */}
              {isOpen && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">

                  {/* Progreso del pedido */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado del pedido</p>
                    <div className="flex items-center gap-1">
                      {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((s, i, arr) => {
                        const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
                        const currentIdx = steps.indexOf(order.status);
                        const done = steps.indexOf(s) <= currentIdx && order.status !== "CANCELLED";
                        const info = statusMap[s];
                        return (
                          <div key={s} className="flex items-center flex-1">
                            <button
                              onClick={() => handleStatusChange(order.id, s)}
                              disabled={isUpdating}
                              className={`flex flex-col items-center gap-1 flex-1 group disabled:opacity-60`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-400"} group-hover:bg-gray-700 group-hover:text-white`}>
                                {i + 1}
                              </div>
                              <span className={`text-xs text-center leading-tight ${done ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                                {info?.label}
                              </span>
                            </button>
                            {i < arr.length - 1 && (
                              <div className={`h-0.5 w-4 flex-shrink-0 ${steps.indexOf(s) < currentIdx && order.status !== "CANCELLED" ? "bg-gray-900" : "bg-gray-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {order.status === "CANCELLED" && (
                      <p className="mt-2 text-xs text-red-500 font-medium">Pedido cancelado</p>
                    )}
                  </div>

                  {/* Dirección de entrega */}
                  {(order.address || order.shippingAddress) && (() => {
                    const addr = order.address ?? order.shippingAddress!;
                    return (
                      <div className="p-3 bg-white rounded-xl border border-gray-200">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Dirección de entrega
                        </p>
                        <p className="text-sm font-medium text-gray-900">{addr.name}</p>
                        <p className="text-sm text-gray-600">{addr.street}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-xs text-gray-400 mt-1">{addr.phone} — {addr.country}</p>
                      </div>
                    );
                  })()}

                  {/* Productos */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Productos del pedido</p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-200" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            {(item.color || item.size) && (
                              <p className="text-xs text-gray-400">
                                {[item.color ? item.color.split("|")[0] : null, item.size].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">L {item.price.toFixed(2)} c/u</span>
                          <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">×{item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-900 w-20 text-right flex-shrink-0">L {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totales */}
                    <div className="mt-4 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-500 max-w-xs ml-auto">
                      <div className="flex justify-between"><span>Subtotal</span><span>L {order.subtotal.toFixed(2)}</span></div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600"><span>Descuento</span><span>−L {order.discount.toFixed(2)}</span></div>
                      )}
                      <div className="flex justify-between"><span>Envío</span><span>{order.shipping === 0 ? "Gratis" : `L ${order.shipping.toFixed(2)}`}</span></div>
                      <div className="flex justify-between font-semibold text-gray-900 text-sm pt-1 border-t border-gray-200">
                        <span>Total</span><span>L {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
