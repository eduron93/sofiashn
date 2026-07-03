"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, BarChart3,
  Percent, Image, FileText, Warehouse, Settings, LogOut, ChevronRight,
  Bookmark, UserCog, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_MENU = [
  { label: "Dashboard",     href: "/admin",               icon: LayoutDashboard, key: "dashboard" },
  { label: "Productos",     href: "/admin/productos",     icon: Package,         key: "productos" },
  { label: "Categorías",    href: "/admin/categorias",    icon: Tag,             key: "categorias" },
  { label: "Marcas",        href: "/admin/marcas",        icon: Bookmark,        key: "marcas" },
  { label: "Pedidos",       href: "/admin/pedidos",       icon: ShoppingCart,    key: "pedidos" },
  { label: "Clientes",      href: "/admin/clientes",      icon: Users,           key: "clientes" },
  { label: "Cupones",       href: "/admin/cupones",       icon: Percent,         key: "cupones" },
  { label: "Reseñas",       href: "/admin/resenas",       icon: Star,            key: "resenas" },
  { label: "Banners",       href: "/admin/banners",       icon: Image,           key: "banners" },
  { label: "Inventario",    href: "/admin/inventario",    icon: Warehouse,       key: "inventario" },
  { label: "Reportes",      href: "/admin/reportes",      icon: BarChart3,       key: "reportes" },
  { label: "Blog",          href: "/admin/blog",          icon: FileText,        key: "blog" },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings,        key: "configuracion" },
  { label: "Usuarios Admin",href: "/admin/usuarios",      icon: UserCog,         key: "usuarios" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [storeName, setStoreName] = useState("SOFIAS HN");

  useEffect(() => {
    fetch("/api/admin/me")
      .then(r => r.json())
      .then(d => setPermissions(d.isSuperAdmin ? null : (d.permissions ?? [])))
      .catch(() => setPermissions([]));
    fetch("/api/config")
      .then(r => r.json())
      .then(d => { if (d.store_name) setStoreName(d.store_name); })
      .catch(() => {});
  }, []);

  const menuItems = permissions === null
    ? ALL_MENU  // null = super admin, ve todo
    : ALL_MENU.filter(item => permissions.includes(item.key));

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex flex-col">
          <span className="text-xl font-bold tracking-widest">{storeName}</span>
          <span className="text-xs text-gray-400 mt-0.5">Panel de Administración</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-6 py-3 text-sm transition-colors group",
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {item.label}
              </div>
              {active && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-2 py-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Ver tienda
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/admin/login", { method: "DELETE" });
            window.location.href = "/admin/login";
          }}
          className="w-full flex items-center gap-3 px-2 py-2 text-gray-400 hover:text-red-400 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
