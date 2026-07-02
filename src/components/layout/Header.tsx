"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Mujeres", href: "/catalogo/mujeres" },
  { label: "Hombres", href: "/catalogo/hombres" },
  { label: "Niños", href: "/catalogo/ninos" },
  { label: "Calzado", href: "/catalogo/calzado" },
  { label: "Hogar", href: "/catalogo/hogar" },
  { label: "Ofertas", href: "/catalogo/ofertas", accent: true },
  { label: "Contacto", href: "/contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartCount = useCartStore((s) => s.itemCount());
  const favCount = useFavoritesStore((s) => s.count());
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const [freeThreshold, setFreeThreshold] = useState("999");
  const [storeName, setStoreName] = useState("VELORA");
  const [storeLogo, setStoreLogo] = useState("");
  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(d => {
      if (d.shipping_free_threshold) setFreeThreshold(d.shipping_free_threshold);
      if (d.store_name) setStoreName(d.store_name);
      if (d.store_logo) setStoreLogo(d.store_logo);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gray-900 text-white text-center text-xs py-2 px-4">
        <span>Envío gratis en pedidos mayores a L. {freeThreshold} — Usa el código: </span>
        <strong>VELORA10</strong>
        <span> para 10% de descuento en tu primera compra</span>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-300",
          isScrolled && "shadow-md"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              {storeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeLogo} alt={storeName} className="h-10 max-w-[140px] object-contain" />
              ) : (
                <motion.span
                  className="text-2xl font-bold tracking-[0.3em] text-gray-900 select-none"
                  whileHover={{ letterSpacing: "0.4em" }}
                  transition={{ duration: 0.3 }}
                >
                  {storeName}
                </motion.span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative group",
                    pathname === link.href
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900",
                    link.accent && "text-rose-600 hover:text-rose-700"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-gray-900 transition-all duration-300",
                      pathname === link.href ? "w-full" : "w-0 group-hover:w-full",
                      link.accent && "bg-rose-600"
                    )}
                  />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                aria-label="Modo oscuro"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link
                href="/favoritos"
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Favoritos"
              >
                <Heart className="w-5 h-5" />
                {mounted && favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {favCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cuenta"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
                aria-label="Cuenta"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos, marcas, categorías..."
                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["Vestidos", "Zapatillas", "Bolsos", "Jeans", "Perfumes"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full px-3 py-1 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold tracking-widest">{storeName}</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "text-gray-900 bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                      link.accent && "text-rose-600"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t space-y-3">
                <Link
                  href="/cuenta"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <User className="w-5 h-5" /> Mi Cuenta
                </Link>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {darkMode ? "Modo Claro" : "Modo Oscuro"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
