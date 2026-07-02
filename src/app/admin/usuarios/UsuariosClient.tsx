"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Loader2, ShieldCheck, ShieldOff } from "lucide-react";

const PANELS = [
  { key: "dashboard",     label: "Dashboard" },
  { key: "productos",     label: "Productos" },
  { key: "categorias",    label: "Categorías" },
  { key: "marcas",        label: "Marcas" },
  { key: "pedidos",       label: "Pedidos" },
  { key: "clientes",      label: "Clientes" },
  { key: "cupones",       label: "Cupones" },
  { key: "resenas",       label: "Reseñas" },
  { key: "banners",       label: "Banners" },
  { key: "inventario",    label: "Inventario" },
  { key: "reportes",      label: "Reportes" },
  { key: "blog",          label: "Blog" },
  { key: "configuracion", label: "Configuración" },
  { key: "usuarios",      label: "Usuarios Admin" },
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const emptyForm = { name: "", email: "", password: "", permissions: [] as string[], isActive: true };

export function UsuariosClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: AdminUser | null }>({ open: false, editing: null });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    if (res.ok) setUsers((await res.json()).users);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (u: AdminUser) => {
    setForm({ name: u.name, email: u.email, password: "", permissions: u.permissions, isActive: u.isActive });
    setError("");
    setModal({ open: true, editing: u });
  };

  const togglePermission = (key: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, permissions: PANELS.map(p => p.key) }));
  const selectNone = () => setForm(f => ({ ...f, permissions: [] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const isEditing = !!modal.editing;
    const body = isEditing
      ? { id: modal.editing!.id, ...form }
      : form;

    const res = await fetch("/api/admin/usuarios", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
    } else {
      setModal({ open: false, editing: null });
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`¿Eliminar a "${u.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(u.id);
    await fetch("/api/admin/usuarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id }),
    });
    setUsers(prev => prev.filter(x => x.id !== u.id));
    setDeleting(null);
  };

  const handleToggleActive = async (u: AdminUser) => {
    const res = await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
    });
    if (res.ok) {
      const { user } = await res.json();
      setUsers(prev => prev.map(x => x.id === u.id ? user : x));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios Admin</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {/* Aviso super admin */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        El super admin (configurado en variables de entorno <code className="font-mono bg-blue-100 px-1 rounded">ADMIN_EMAIL</code> / <code className="font-mono bg-blue-100 px-1 rounded">ADMIN_PASSWORD</code>) siempre tiene acceso completo y no aparece aquí.
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No hay usuarios creados. <button onClick={openCreate} className="underline">Crear el primero</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Usuario</th>
                <th className="px-6 py-3 text-left">Paneles con acceso</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Creado</th>
                <th className="px-6 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {u.permissions.length === 0
                        ? <span className="text-xs text-gray-400 italic">Sin permisos</span>
                        : u.permissions.map(p => {
                            const panel = PANELS.find(x => x.key === p);
                            return (
                              <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {panel?.label ?? p}
                              </span>
                            );
                          })
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("es-HN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleActive(u)}
                        title={u.isActive ? "Desactivar" : "Activar"}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        {u.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(u)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u)} disabled={deleting === u.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal.editing ? "Editar usuario" : "Nuevo usuario admin"}
              </h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contraseña {modal.editing && <span className="text-gray-400">(dejar vacío para no cambiar)</span>}
                </label>
                <input type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required={!modal.editing} placeholder={modal.editing ? "••••••" : "Mínimo 6 caracteres"}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Paneles con acceso</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAll} className="text-xs text-blue-600 hover:underline">Todos</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onClick={selectNone} className="text-xs text-gray-500 hover:underline">Ninguno</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PANELS.map(panel => (
                    <label key={panel.key} className="flex items-center gap-2 cursor-pointer select-none group">
                      <input type="checkbox" checked={form.permissions.includes(panel.key)}
                        onChange={() => togglePermission(panel.key)}
                        className="w-4 h-4 rounded accent-gray-900 cursor-pointer" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{panel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {modal.editing && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-gray-900" />
                  <span className="text-sm text-gray-700">Usuario activo</span>
                </label>
              )}
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setModal({ open: false, editing: null })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.editing ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
