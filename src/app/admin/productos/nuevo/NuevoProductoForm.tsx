"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload, Loader2 } from "lucide-react";

interface Category { id: string; name: string; slug: string; }
interface Brand { id: string; name: string; }

// Palabras clave en el nombre/slug de la categoría → tallas predefinidas
const SIZE_PRESETS: { keywords: string[]; sizes: string[] }[] = [
  {
    keywords: ["calzado", "zapato", "zapatilla", "tenis", "bota", "sandalia", "shoe", "footwear"],
    sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  },
  {
    keywords: ["nino", "niño", "kids", "infantil", "bebe", "bebé", "child"],
    sizes: ["2", "4", "6", "8", "10", "12", "14", "16"],
  },
  {
    keywords: ["pantalon", "pantalón", "jean", "jeans", "short", "bermuda", "falda", "skirt", "pants", "legging"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "24", "26", "28", "30", "32", "34", "36"],
  },
  {
    keywords: ["camisa", "camiseta", "blusa", "polo", "playera", "remera", "top", "shirt", "sweater", "hoodie", "jacket", "chaqueta", "abrigo", "vestido", "dress", "ropa", "mujer", "hombre", "women", "men"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    keywords: ["accesorio", "bolso", "cartera", "bolsa", "bag", "accessory"],
    sizes: ["Único"],
  },
];

function getSizesForCategory(category: Category | undefined): string[] {
  if (!category) return [];
  const text = `${category.name} ${category.slug}`.toLowerCase();
  for (const preset of SIZE_PRESETS) {
    if (preset.keywords.some((kw) => text.includes(kw))) return preset.sizes;
  }
  // Fallback genérico
  return ["XS", "S", "M", "L", "XL", "XXL"];
}

const empty = {
  name: "",
  description: "",
  features: [] as string[],
  price: "",
  comparePrice: "",
  stock: "0",
  sku: "",
  categoryId: "",
  brandId: "",
  sizes: [] as string[],
  colors: [] as string[],
  images: [] as string[],
  isActive: true,
  isFeatured: false,
  isNew: true,
  isBestSeller: false,
};

export function NuevoProductoForm({ categories, brands: initialBrands }: { categories: Category[]; brands: Brand[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...empty, categoryId: categories[0]?.id ?? "", sizes: getSizesForCategory(categories[0]) });
  const [imageInput, setImageInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const set = (key: string, value: string | boolean | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const [featureInput, setFeatureInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("#000000");
  const [colorName, setColorName] = useState("");

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val || form.features.includes(val)) return;
    set("features", [...form.features, val]);
    setFeatureInput("");
  };

  const removeFeature = (f: string) =>
    set("features", form.features.filter((x) => x !== f));

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    // Pre-cargar las tallas sugeridas pero el usuario puede editarlas
    setForm((f) => ({ ...f, categoryId, sizes: getSizesForCategory(cat) }));
  };

  const addSize = () => {
    const val = sizeInput.trim().toUpperCase();
    if (!val || form.sizes.includes(val)) return;
    set("sizes", [...form.sizes, val]);
    setSizeInput("");
  };

  const removeSize = (size: string) =>
    set("sizes", form.sizes.filter((s) => s !== size));

  const addColor = () => {
    const name = colorName.trim() || colorInput;
    const entry = `${name}|${colorInput}`;
    if (!colorInput || form.colors.some((c) => c.split("|")[1] === colorInput)) return;
    set("colors", [...form.colors, entry]);
    setColorName("");
  };

  const removeColor = (color: string) =>
    set("colors", form.colors.filter((c) => c !== color));

  const suggestedSizes = getSizesForCategory(categories.find((c) => c.id === form.categoryId))
    .filter((s) => !form.sizes.includes(s));

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    set("images", [...form.images, url]);
    setImageInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      set("images", [...form.images, data.url]);
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (i: number) =>
    set("images", form.images.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al crear el producto"); return; }
      router.push("/admin/productos");
    } catch {
      setError("Error al crear el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Información General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" required value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
            </div>

            {/* Características */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  placeholder="Ej: Material 100% algodón, Resistente al agua..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button type="button" onClick={addFeature}
                  className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.features.length > 0 ? (
                <ul className="space-y-1.5">
                  {form.features.map((feat) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio (LPS) *</label>
                <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio comparación</label>
                <input type="number" min="0" step="0.01" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input type="number" required min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Imágenes</h2>
          {/* Subir desde dispositivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors mb-4 disabled:opacity-60"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
            ) : (
              <><Upload className="w-4 h-4" /> Haz clic para subir una imagen (JPG, PNG, WebP · máx. 5 MB)</>
            )}
          </button>

          {/* O pegar URL */}
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
              placeholder="O pegar URL de imagen..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button type="button" onClick={addImage}
              className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              <Plus className="w-4 h-4" /> Añadir
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Organización</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select required value={form.categoryId} onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="">Seleccionar</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              {!showNewBrand ? (
                <div className="flex gap-2">
                  <select value={form.brandId} onChange={(e) => set("brandId", e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="">Sin marca</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewBrand(true)}
                    className="flex-shrink-0 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                    title="Crear nueva marca"
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
                      className="flex-1 border border-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button
                      type="button"
                      onClick={handleCreateBrand}
                      disabled={creatingBrand}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                    >
                      {creatingBrand ? "..." : "Crear"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewBrand(false); setBrandError(""); }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tallas</h2>

          {/* Input para agregar */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
              placeholder="Ej: M, 42, XL, 32..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="button"
              onClick={addSize}
              className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Tallas agregadas */}
          {form.sizes.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {form.sizes.map((size) => (
                <span
                  key={size}
                  className="flex items-center gap-1 bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="ml-0.5 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-4">No hay tallas agregadas</p>
          )}

          {/* Sugerencias según categoría */}
          {suggestedSizes.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Sugeridas para esta categoría:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => set("sizes", [...form.sizes, size])}
                    className="px-2.5 py-1 border border-dashed border-gray-300 text-gray-500 text-xs rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    + {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colores */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Colores</h2>
          <div className="space-y-2 mb-4">
            <input
              type="text"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
              placeholder="Nombre del color (ej: Rojo, Marino...)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <div className="flex gap-2">
              <input
                type="color"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="w-12 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
              />
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="#000000"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                type="button"
                onClick={addColor}
                className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          {form.colors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.colors.map((color) => {
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
          ) : (
            <p className="text-xs text-gray-400">No hay colores agregados</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Estado</h2>
          <div className="space-y-3">
            {[
              { key: "isActive", label: "Activo" },
              { key: "isFeatured", label: "Destacado" },
              { key: "isNew", label: "Nuevo" },
              { key: "isBestSeller", label: "Más vendido" },
            ].map((field) => (
              <label key={field.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">{field.label}</span>
                <input type="checkbox"
                  checked={form[field.key as keyof typeof form] as boolean}
                  onChange={(e) => set(field.key, e.target.checked)}
                  className="w-4 h-4 accent-gray-900" />
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3">
          <a href="/admin/productos"
            className="flex-1 text-center border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </a>
          <button type="submit" disabled={saving}
            className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60">
            {saving ? "Creando..." : "Crear Producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
