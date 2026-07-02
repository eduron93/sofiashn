"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category { id: string; name: string; slug: string; }
interface Brand { id: string; name: string; }
interface Product {
  id: string; name: string; description: string | null; features: string[];
  price: number; comparePrice: number | null; stock: number; sku: string | null;
  categoryId: string | null; brandId: string | null;
  sizes: string[]; colors: string[]; images: string[]; isActive: boolean;
  isFeatured: boolean; isNew: boolean; isBestSeller: boolean;
}

const SIZE_PRESETS: { keywords: string[]; sizes: string[] }[] = [
  { keywords: ["calzado","zapato","zapatilla","tenis","bota","sandalia","shoe","footwear"], sizes: ["35","36","37","38","39","40","41","42","43","44","45"] },
  { keywords: ["nino","niño","kids","infantil","bebe","bebé","child"], sizes: ["2","4","6","8","10","12","14","16"] },
  { keywords: ["pantalon","pantalón","jean","jeans","short","bermuda","falda","skirt","pants","legging"], sizes: ["XS","S","M","L","XL","XXL","24","26","28","30","32","34","36"] },
  { keywords: ["camisa","camiseta","blusa","polo","playera","remera","top","shirt","sweater","hoodie","jacket","chaqueta","abrigo","vestido","dress","ropa","mujer","hombre","women","men"], sizes: ["XS","S","M","L","XL","XXL","3XL"] },
  { keywords: ["accesorio","bolso","cartera","bolsa","bag","accessory"], sizes: ["Único"] },
];

function getSizesForCategory(categories: Category[], categoryId: string): string[] {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return ["XS","S","M","L","XL","XXL"];
  const text = `${cat.name} ${cat.slug}`.toLowerCase();
  for (const preset of SIZE_PRESETS) {
    if (preset.keywords.some((kw) => text.includes(kw))) return preset.sizes;
  }
  return ["XS","S","M","L","XL","XXL"];
}

export function EditarProductoForm({
  product, categories, brands: initialBrands,
}: {
  product: Product; categories: Category[]; brands: Brand[];
}) {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [newBrandName, setNewBrandName] = useState("");
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [brandError, setBrandError] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    setBrandError("");
    try {
      const res = await fetch("/api/admin/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setBrandError(data.error); return; }
      setBrands((prev) => [...prev, data.brand]);
      set("brandId", data.brand.id);
      setNewBrandName("");
      setShowNewBrand(false);
    } catch {
      setBrandError("Error al crear la marca");
    } finally {
      setCreatingBrand(false);
    }
  };

  const [form, setForm] = useState({
    name: product.name,
    description: product.description ?? "",
    price: product.price.toString(),
    comparePrice: product.comparePrice?.toString() ?? "",
    stock: product.stock.toString(),
    sku: product.sku ?? "",
    categoryId: product.categoryId ?? "",
    brandId: product.brandId ?? "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
  });
  const [features, setFeatures] = useState<string[]>(product.features ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [sizes, setSizes] = useState<string[]>(product.sizes);
  const [sizeInput, setSizeInput] = useState("");

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val || features.includes(val)) return;
    setFeatures(f => [...f, val]);
    setFeatureInput("");
  };
  const removeFeature = (f: string) => setFeatures(prev => prev.filter(x => x !== f));
  const [colors, setColors] = useState<string[]>(product.colors);
  const [colorInput, setColorInput] = useState("#000000");
  const [colorName, setColorName] = useState("");
  const [images, setImages] = useState<string[]>(product.images);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const addSize = () => {
    const val = sizeInput.trim().toUpperCase();
    if (val && !sizes.includes(val)) setSizes((s) => [...s, val]);
    setSizeInput("");
  };

  const addSizeFromPreset = (size: string) => {
    if (!sizes.includes(size)) setSizes((s) => [...s, size]);
  };

  const removeSize = (size: string) => setSizes((s) => s.filter((x) => x !== size));

  const addColor = () => {
    const name = colorName.trim() || colorInput;
    const entry = `${name}|${colorInput}`;
    if (!colorInput || colors.some((c) => c.split("|")[1] === colorInput)) return;
    setColors((c) => [...c, entry]);
    setColorName("");
  };

  const removeColor = (color: string) => setColors((c) => c.filter((x) => x !== color));

  const suggestedSizes = form.categoryId
    ? getSizesForCategory(categories, form.categoryId).filter((s) => !sizes.includes(s))
    : [];

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setImages((imgs) => [...imgs, data.url]);
      else setError(data.error ?? "Error al subir imagen");
    } catch {
      setError("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (url && !images.includes(url)) setImages((imgs) => [...imgs, url]);
    setImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) { setError("Nombre, precio y stock son requeridos"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
          stock: parseInt(form.stock),
          categoryId: form.categoryId || null,
          brandId: form.brandId || null,
          features,
          sizes,
          colors,
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link href="/admin/productos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

      {/* Información básica */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información básica</h2>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nombre *</label>
          <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Descripción</label>
          <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Características</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
              placeholder="Ej: Material 100% algodón, Resistente al agua..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button type="button" onClick={addFeature}
              className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {features.length > 0 ? (
            <ul className="space-y-1.5">
              {features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  <span className="flex-1">{feat}</span>
                  <button type="button" onClick={() => removeFeature(feat)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Agrega características del producto una por una</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Precio *</label>
            <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Precio anterior</label>
            <input type="number" min="0" step="0.01" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Stock *</label>
            <input type="number" required min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">SKU</label>
            <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Marca</label>
            {!showNewBrand ? (
              <div className="flex gap-2">
                <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                  <option value="">Sin marca</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewBrand(true)}
                  className="flex-shrink-0 px-3 py-2 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                >
                  + Nueva
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {brandError && <p className="text-xs text-red-600">{brandError}</p>}
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateBrand(); } if (e.key === "Escape") { setShowNewBrand(false); setBrandError(""); } }}
                    placeholder="Nombre de la nueva marca..."
                    className="flex-1 border border-gray-900 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleCreateBrand}
                    disabled={creatingBrand}
                    className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    {creatingBrand ? "..." : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewBrand(false); setBrandError(""); }}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tallas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Tallas</h2>
        <div className="flex gap-2">
          <input
            type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
            placeholder="Ej: S, M, 42, 28..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button type="button" onClick={addSize}
            className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span key={size} className="flex items-center gap-1 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                {size}
                <button type="button" onClick={() => removeSize(size)} className="hover:text-gray-300 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {suggestedSizes.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Sugerencias para esta categoría:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedSizes.map((size) => (
                <button key={size} type="button" onClick={() => addSizeFromPreset(size)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors">
                  + {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Colores */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Colores</h2>
        <div className="space-y-2">
          <input
            type="text"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
            placeholder="Nombre del color (ej: Rojo, Marino...)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <div className="flex gap-2">
            <input
              type="color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
            />
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="#000000"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button type="button" onClick={addColor}
              className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const [name, hex] = color.includes("|") ? color.split("|") : [color, color];
              return (
                <div key={color} className="flex items-center gap-1.5 border border-gray-200 rounded-lg pl-2 pr-1 py-1">
                  <span className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: hex }} />
                  <span className="text-xs text-gray-700 font-medium">{name}</span>
                  <span className="text-xs font-mono text-gray-400">{hex}</span>
                  <button type="button" onClick={() => removeColor(color)} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {colors.length === 0 && <p className="text-xs text-gray-400">No hay colores agregados</p>}
      </div>

      {/* Imágenes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Imágenes</h2>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 border border-dashed border-gray-300 text-gray-500 px-4 py-2 rounded-xl text-sm hover:border-gray-900 hover:text-gray-900 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Subiendo..." : "Subir archivo"}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
        </div>
        <div className="flex gap-2">
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
            placeholder="https://..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          <button type="button" onClick={addImageUrl}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Agregar URL
          </button>
        </div>
      </div>

      {/* Estado */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Estado y etiquetas</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "isActive", label: "Activo" },
            { key: "isFeatured", label: "Destacado" },
            { key: "isNew", label: "Nuevo" },
            { key: "isBestSeller", label: "Más vendido" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 cursor-pointer transition-colors">
              <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-gray-900" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pb-8">
        <Link href="/admin/productos"
          className="flex-1 text-center border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancelar
        </Link>
        <button type="submit" disabled={saving}
          className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
