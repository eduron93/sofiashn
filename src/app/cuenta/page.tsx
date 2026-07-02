"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, Lock, LogOut, ChevronRight, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const menuItems = [
  { icon: Package, label: "Mis Pedidos", href: "/cuenta/pedidos" },
  { icon: Truck, label: "Rastrear Pedido", href: "/rastrear" },
  { icon: Heart, label: "Mis Favoritos", href: "/favoritos" },
  { icon: MapPin, label: "Mis Direcciones", href: "/cuenta/direcciones" },
  { icon: Lock, label: "Cambiar Contraseña", href: "/cuenta/contrasena" },
];

export default function AccountPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUser(data.user);
        window.location.href = redirect;
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("¡Cuenta creada! Inicia sesión.");
        setActiveTab("login");
        setLoginData({ email: registerData.email, password: registerData.password });
      }
    } catch {
      setError("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // — Panel de usuario autenticado —
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header del perfil */}
            <div className="bg-gray-900 px-8 py-8 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <Image src={user.image} alt={user.name} width={64} height={64} className="object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-white text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
                {user.role === "ADMIN" && (
                  <span className="inline-block mt-1 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    Administrador
                  </span>
                )}
              </div>
            </div>

            {/* Menú */}
            <nav className="divide-y divide-gray-50">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-600">Panel de Administración</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              )}
            </nav>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Miembro desde {new Date(user.createdAt).toLocaleDateString("es-HN", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    );
  }

  // — Formulario de login/registro —
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold tracking-[0.3em]">VELORA</span>
          <p className="text-gray-500 mt-2 text-sm">Tu cuenta personal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "login" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === "register" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Crear Cuenta
            </button>
          </div>

          <div className="p-8">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4">{success}</div>}

            {activeTab === "login" ? (
              <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData((d) => ({ ...d, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData((d) => ({ ...d, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400">O continúa con</span></div>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/cuenta" })}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <GoogleIcon />
                  Continuar con Google
                </button>

                <p className="text-center text-xs text-gray-400">
                  <Link href="/contrasena-olvidada" className="underline hover:text-gray-600">¿Olvidaste tu contraseña?</Link>
                </p>
              </motion.form>
            ) : (
              <motion.form key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleRegister} className="space-y-4">
                {[
                  { label: "Nombre completo", key: "name", type: "text" },
                  { label: "Correo electrónico", key: "email", type: "email" },
                  { label: "Contraseña (mín. 6 caracteres)", key: "password", type: "password" },
                  { label: "Confirmar contraseña", key: "confirm", type: "password" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      value={(registerData as any)[field.key]}
                      onChange={(e) => setRegisterData((d) => ({ ...d, [field.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400">O regístrate con</span></div>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/cuenta" })}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
                >
                  <GoogleIcon />
                  Continuar con Google
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Al crear tu cuenta aceptas nuestros{" "}
                  <Link href="/terminos" className="underline">Términos</Link> y{" "}
                  <Link href="/privacidad" className="underline">Política de Privacidad</Link>
                </p>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
