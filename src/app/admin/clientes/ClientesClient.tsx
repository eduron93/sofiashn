"use client";

import { useState, useMemo } from "react";
import { Search, X, Trash2, ShieldOff, ShieldCheck, Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

export function ClientesClient({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      (c.name ?? "").toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleToggleActive = async (c: Client) => {
    setLoading(c.id + "-active");
    const res = await fetch("/api/admin/clientes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    if (res.ok) {
      setClients(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !c.isActive } : x));
    }
    setLoading(null);
  };

  const handleDelete = async (c: Client) => {
    if (!confirm(`¿Eliminar a "${c.name ?? c.email}"? Se borrarán todos sus datos. Esta acción no se puede deshacer.`)) return;
    setLoading(c.id + "-delete");
    const res = await fetch("/api/admin/clientes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id }),
    });
    if (res.ok) {
      setClients(prev => prev.filter(x => x.id !== c.id));
    }
    setLoading(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length !== clients.length
              ? `${filtered.length} de ${clients.length} clientes`
              : `${clients.length} clientes registrados`}
          </p>
        </div>
        <div className="sm:ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white w-72"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nombre</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Pedidos</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Estado</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Registro</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-12 text-sm">
                  {search
                    ? <><span>No se encontraron clientes con </span><span className="font-medium">"{search}"</span>. <button onClick={() => setSearch("")} className="underline">Limpiar</button></>
                    : "No hay clientes registrados"
                  }
                </td>
              </tr>
            ) : (
              filtered.map(c => {
                const isLoadingActive = loading === c.id + "-active";
                const isLoadingDelete = loading === c.id + "-delete";
                const busy = isLoadingActive || isLoadingDelete;
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${!c.isActive ? "opacity-50" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                          {c.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{c.name ?? "Sin nombre"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c._count.orders}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {c.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("es-HN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(c)}
                          disabled={busy}
                          title={c.isActive ? "Desactivar" : "Activar"}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoadingActive
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : c.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={busy}
                          title="Eliminar cliente"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoadingDelete
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
