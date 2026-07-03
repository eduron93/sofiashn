import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toaster } from "@/components/ui/Toaster";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { NewsletterPopup } from "@/components/marketing/NewsletterPopup";
import { FavoritesSync } from "@/components/layout/FavoritesSync";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { headers } from "next/headers";

function getStoreConfig(): { maintenance: boolean; name: string; description: string } {
  try {
    const path = join(process.cwd(), "store-config.json");
    if (!existsSync(path)) return { maintenance: false, name: "SOFIAS HN", description: "" };
    const cfg = JSON.parse(readFileSync(path, "utf-8"));
    return {
      maintenance: cfg.maintenance_mode === "true",
      name: cfg.store_name || "SOFIAS HN",
      description: cfg.seo_description || cfg.store_description || "",
    };
  } catch {
    return { maintenance: false, name: "SOFIAS HN", description: "" };
  }
}

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { name, description } = getStoreConfig();
  const desc = description || `Descubre moda premium en ${name}. Ropa, calzado y accesorios. Envíos rápidos y pago seguro.`;
  return {
    title: {
      default: `${name} — Moda Premium para Toda la Familia`,
      template: `%s | ${name}`,
    },
    description: desc,
    keywords: ["moda", "ropa", name.toLowerCase(), "tienda online", "mujer", "hombre", "niños", "calzado", "accesorios"],
    openGraph: {
      type: "website",
      locale: "es_HN",
      siteName: name,
      title: `${name} — Moda Premium para Toda la Familia`,
      description: desc,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const { maintenance, name: storeName } = getStoreConfig();
  const isAdmin = pathname.startsWith("/admin");

  if (maintenance && !isAdmin) {
    return (
      <html lang="es">
        <body className={`${geistSans.variable} font-sans antialiased bg-gray-900 text-white flex items-center justify-center min-h-screen`}>
          <div className="text-center px-6">
            <p className="text-5xl font-bold tracking-[0.3em] mb-6">{storeName}</p>
            <p className="text-xl font-semibold mb-2">Estamos en mantenimiento</p>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">Estamos mejorando nuestra tienda para ofrecerte una mejor experiencia. Vuelve pronto.</p>
          </div>
        </body>
      </html>
    );
  }

  if (isAdmin) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body className={`${geistSans.variable} font-sans antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased bg-white text-gray-900`}>
        <Header />
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
        <NewsletterPopup />
        <FavoritesSync />
        <Toaster />
      </body>
    </html>
  );
}
