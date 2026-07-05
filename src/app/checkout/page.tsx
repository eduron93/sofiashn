"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, Truck, User, Lock, MapPin, Tag, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

const steps = ["Datos", "Envío", "Pago", "Confirmación"];

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormError, setAddressFormError] = useState("");
  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", street: "", city: "", state: "", zipCode: "", country: "Honduras",
  });

  const [paymentConfig, setPaymentConfig] = useState({
    cod: true,
    transfer: true,
    card: false,
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    whatsapp: "",
  });
  const [shippingConfig, setShippingConfig] = useState({
    freeThreshold: 999,
    standardPrice: 99,
    expressPrice: 150,
    standardDays: "3-5 días hábiles",
    expressDays: "1-2 días hábiles",
    freeEnabled: true,
    expressEnabled: true,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Honduras",
    shippingMethod: "standard",
    paymentMethod: "delivery",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCVC: "",
    notes: "",
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // ── Derived values ─────────────────────────────────────────────────────────
  const subtotal = total();
  const shippingBase =
    formData.shippingMethod === "express"
      ? shippingConfig.expressPrice
      : shippingConfig.freeEnabled && subtotal >= shippingConfig.freeThreshold
      ? 0
      : shippingConfig.standardPrice;
  const shipping = couponType === "FREE_SHIPPING" ? 0 : shippingBase;
  const grandTotal = Math.max(0, subtotal + shipping - couponDiscount);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadUserData() {
      try {
        const [meRes, addrRes, configRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/cuenta/direcciones"),
          fetch("/api/config"),
        ]);

        if (configRes.ok) {
          const cfg = await configRes.json();
          const codEnabled = cfg.payment_cod_enabled !== "false";
          const transferEnabled = cfg.payment_transfer_enabled !== "false";
          const cardEnabled = cfg.payment_card_enabled === "true";
          setPaymentConfig({
            cod: codEnabled,
            transfer: transferEnabled,
            card: cardEnabled,
            bankName: cfg.payment_bank_name ?? "",
            bankAccount: cfg.payment_bank_account ?? "",
            bankHolder: cfg.payment_bank_holder ?? "",
            whatsapp: cfg.social_whatsapp ?? "",
          });
          setShippingConfig({
            freeThreshold: parseFloat(cfg.shipping_free_threshold ?? "999"),
            standardPrice: parseFloat(cfg.shipping_standard_price ?? "99"),
            expressPrice: parseFloat(cfg.shipping_express_price ?? "150"),
            standardDays: cfg.shipping_estimated_days ?? "3-5 días hábiles",
            expressDays: cfg.shipping_express_days ?? "1-2 días hábiles",
            freeEnabled: cfg.shipping_free_enabled !== "false",
            expressEnabled: cfg.shipping_express_enabled !== "false",
          });
          const defaultMethod = codEnabled
            ? "delivery"
            : transferEnabled
            ? "transfer"
            : cardEnabled
            ? "card"
            : "";
          setFormData((prev) => ({ ...prev, paymentMethod: defaultMethod }));
        }

        if (meRes.ok) {
          const { user } = await meRes.json();
          if (user) {
            setIsLoggedIn(true);
            setFormData((prev) => ({
              ...prev,
              name: user.name ?? prev.name,
              email: user.email ?? prev.email,
            }));
            setNewAddress((prev) => ({ ...prev, name: user.name ?? "", phone: user.phone ?? "" }));
          }
        }

        if (addrRes.ok) {
          const { addresses: addrs } = await addrRes.json();
          if (Array.isArray(addrs) && addrs.length > 0) {
            setAddresses(addrs);
            const def = addrs.find((a: Address) => a.isDefault) ?? addrs[0];
            setSelectedAddressId(def.id);
            setFormData((prev) => ({
              ...prev,
              phone: def.phone,
              street: def.street,
              city: def.city,
              state: def.state,
              zipCode: def.zipCode,
              country: def.country,
            }));
          }
        }
      } catch {
        // sin sesión — el formulario queda vacío para llenarlo manualmente
      }
    }
    loadUserData();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const update = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
    }));
  };

  const handleAddAddress = async () => {
    const { name, phone, street, city, state, zipCode } = newAddress;
    if (!name || !phone || !street || !city || !state || !zipCode) {
      setAddressFormError("Completa todos los campos");
      return;
    }
    setSavingAddress(true);
    setAddressFormError("");
    try {
      const res = await fetch("/api/cuenta/direcciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAddress, isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) { setAddressFormError(data.error ?? "Error al guardar"); return; }
      const addr: Address = data.address;
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddressId(addr.id);
      setFormData((prev) => ({
        ...prev,
        phone: addr.phone,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
      }));
      setShowAddressForm(false);
      setNewAddress({ name: "", phone: "", street: "", city: "", state: "", zipCode: "", country: "Honduras" });
    } catch {
      setAddressFormError("Error de conexión");
    } finally {
      setSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Cupón inválido");
        setCouponDiscount(0);
        setCouponType(null);
        setCouponCode("");
        return;
      }
      setCouponCode(data.coupon.code);
      setCouponDiscount(data.discount ?? 0);
      setCouponType(data.coupon.type);
      setCouponError("");
    } catch {
      setCouponError("Error al validar el cupón");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponInput("");
    setCouponCode("");
    setCouponDiscount(0);
    setCouponType(null);
    setCouponError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            quantity: i.quantity,
            price: i.price,
            color: i.color,
            size: i.size,
          })),
          subtotal,
          shipping,
          discount: couponDiscount,
          total: grandTotal,
          paymentMethod: formData.paymentMethod,
          addressId: selectedAddressId,
          notes: formData.notes,
          ...(couponCode ? { couponCode } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Error al procesar el pedido");
        return;
      }
      setOrderNumber(data.orderNumber);
      clearCart();
      setStep(3);
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart guard (after all hooks) ────────────────────────────────────
  if (items.length === 0 && step < 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-400">Tu carrito está vacío</p>
          <button
            onClick={() => router.push("/catalogo")}
            className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-full text-sm"
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold tracking-[0.3em]">SOFIAS HN</span>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Compra 100% segura
          </p>
        </div>

        {/* Steps */}
        {step < 3 && (
          <div className="flex items-center justify-center mb-10">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${i <= step ? "text-gray-900" : "text-gray-300"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < 2 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">

              {/* Step 0: Personal data */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <User className="w-5 h-5" /> Datos de entrega
                  </h2>

                  {/* Login prompt */}
                  {!isLoggedIn && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-amber-800 mb-1">Inicia sesión para continuar</p>
                      <p className="text-xs text-amber-700 mb-3">Necesitas una cuenta para realizar pedidos y guardar tu dirección de entrega.</p>
                      <a href="/cuenta?redirect=/checkout" className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
                        Iniciar sesión →
                      </a>
                    </div>
                  )}

                  {/* No address prompt */}
                  {isLoggedIn && addresses.length === 0 && (
                    <div className="mb-6">
                      {!showAddressForm ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center">
                          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-gray-700 mb-1">No tienes una dirección de entrega</p>
                          <p className="text-xs text-gray-400 mb-3">Agrega tu dirección para continuar con el pedido</p>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(true)}
                            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                          >
                            + Agregar dirección
                          </button>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> Nueva dirección de entrega
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: "Nombre completo", key: "name", full: true },
                              { label: "Teléfono", key: "phone" },
                              { label: "Calle y número", key: "street", full: true },
                              { label: "Ciudad", key: "city" },
                              { label: "Departamento", key: "state" },
                              { label: "Código Postal", key: "zipCode" },
                            ].map((f) => (
                              <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">{f.label}</label>
                                <input
                                  type="text"
                                  value={(newAddress as any)[f.key]}
                                  onChange={(e) => setNewAddress((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                              </div>
                            ))}
                          </div>
                          {addressFormError && (
                            <p className="text-xs text-red-500 mt-2">{addressFormError}</p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => { setShowAddressForm(false); setAddressFormError(""); }}
                              className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleAddAddress}
                              disabled={savingAddress}
                              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
                            >
                              {savingAddress ? "Guardando..." : "Guardar dirección"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {addresses.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Tus direcciones guardadas
                      </p>
                      <div className="space-y-2">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectAddress(addr)}
                            className={`w-full text-left p-3 border-2 rounded-xl text-sm transition-colors ${
                              selectedAddressId === addr.id
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-gray-900">{addr.name}</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                  {addr.street}, {addr.city}, {addr.state} — {addr.phone}
                                </p>
                              </div>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                  Principal
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs text-gray-500 underline mt-2 inline-block"
                      >
                        + Agregar nueva dirección
                      </button>
                      {showAddressForm && (
                        <div className="mt-3 border border-gray-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> Nueva dirección
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: "Nombre completo", key: "name", full: true },
                              { label: "Teléfono", key: "phone" },
                              { label: "Calle y número", key: "street", full: true },
                              { label: "Ciudad", key: "city" },
                              { label: "Departamento", key: "state" },
                              { label: "Código Postal", key: "zipCode" },
                            ].map((f) => (
                              <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">{f.label}</label>
                                <input
                                  type="text"
                                  value={(newAddress as any)[f.key]}
                                  onChange={(e) => setNewAddress((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                              </div>
                            ))}
                          </div>
                          {addressFormError && <p className="text-xs text-red-500 mt-2">{addressFormError}</p>}
                          <div className="flex gap-2 mt-3">
                            <button type="button" onClick={() => { setShowAddressForm(false); setAddressFormError(""); }}
                              className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                              Cancelar
                            </button>
                            <button type="button" onClick={handleAddAddress} disabled={savingAddress}
                              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60">
                              {savingAddress ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="border-t border-gray-100 my-4" />
                    </div>
                  )}

                  {/* Datos del cliente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Nombre completo", key: "name", type: "text", full: true },
                      { label: "Correo electrónico", key: "email", type: "email", full: false },
                    ].map((field) => (
                      <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={(formData as any)[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    disabled={!formData.name || !formData.email || !selectedAddressId}
                    className="mt-6 w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                  >
                    Continuar al Envío →
                  </button>
                  {!selectedAddressId && isLoggedIn && (
                    <p className="text-xs text-center text-gray-400 mt-2">Selecciona o agrega una dirección de entrega para continuar</p>
                  )}
                </motion.div>
              )}

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5" /> Método de Envío
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        value: "standard",
                        label: "Envío Estándar",
                        desc: shippingConfig.standardDays,
                        price:
                          shippingConfig.freeEnabled && subtotal >= shippingConfig.freeThreshold
                            ? "GRATIS"
                            : `L ${shippingConfig.standardPrice}`,
                      },
                      ...(shippingConfig.expressEnabled
                        ? [
                            {
                              value: "express",
                              label: "Envío Express",
                              desc: shippingConfig.expressDays,
                              price: `L ${shippingConfig.expressPrice}`,
                            },
                          ]
                        : []),
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          formData.shippingMethod === opt.value
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={opt.value}
                            checked={formData.shippingMethod === opt.value}
                            onChange={() => update("shippingMethod", opt.value)}
                            className="accent-gray-900"
                          />
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-gray-400">{opt.desc}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">{opt.price}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 border border-gray-200 py-4 rounded-xl text-sm font-medium hover:bg-gray-50"
                    >
                      ← Volver
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800"
                    >
                      Continuar al Pago →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Método de Pago
                  </h2>
                  <div className="space-y-3 mb-6">
                    {[
                      { value: "delivery", label: "Pago contra entrega", enabled: paymentConfig.cod },
                      { value: "transfer", label: "Transferencia bancaria", enabled: paymentConfig.transfer },
                      { value: "card", label: "Tarjeta de Crédito/Débito", enabled: paymentConfig.card },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-colors ${
                          !opt.enabled
                            ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                            : formData.paymentMethod === opt.value
                            ? "border-gray-900 bg-gray-50 cursor-pointer"
                            : "border-gray-100 hover:border-gray-200 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={formData.paymentMethod === opt.value}
                          onChange={() => opt.enabled && update("paymentMethod", opt.value)}
                          disabled={!opt.enabled}
                          className="accent-gray-900"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-sm">{opt.label}</span>
                          {!opt.enabled && (
                            <p className="text-xs text-gray-400 mt-0.5">No disponible por el momento</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === "card" && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4 mb-6">
                      <input
                        placeholder="Número de tarjeta"
                        value={formData.cardNumber}
                        onChange={(e) => update("cardNumber", e.target.value)}
                        maxLength={19}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                      />
                      <input
                        placeholder="Nombre en la tarjeta"
                        value={formData.cardName}
                        onChange={(e) => update("cardName", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="MM/AA"
                          value={formData.cardExpiry}
                          onChange={(e) => update("cardExpiry", e.target.value)}
                          maxLength={5}
                          className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                        />
                        <input
                          placeholder="CVC"
                          value={formData.cardCVC}
                          onChange={(e) => update("cardCVC", e.target.value)}
                          maxLength={4}
                          className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "transfer" && (
                    <>
                      <div className="bg-gray-50 rounded-xl p-4 mb-3 text-sm space-y-1">
                        <p className="font-semibold text-gray-900">Datos bancarios</p>
                        {paymentConfig.bankName && <p className="text-gray-500">{paymentConfig.bankName}</p>}
                        {paymentConfig.bankAccount && (
                          <p className="text-gray-500">Cuenta: {paymentConfig.bankAccount}</p>
                        )}
                        {paymentConfig.bankHolder && (
                          <p className="text-gray-500">Titular: {paymentConfig.bankHolder}</p>
                        )}
                      </div>
                      {paymentConfig.whatsapp && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882l6.18-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.371l-.36-.213-3.667.853.92-3.573-.234-.369A9.818 9.818 0 1112 21.818z"/>
                          </svg>
                          <div>
                            <p className="text-xs font-semibold text-green-800">Envía tu comprobante de pago</p>
                            <p className="text-xs text-green-700 mt-0.5">
                              Una vez realizada la transferencia, envía el comprobante al WhatsApp{" "}
                              <a
                                href={`https://wa.me/${paymentConfig.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold underline"
                              >
                                {paymentConfig.whatsapp}
                              </a>{" "}
                              para confirmar tu pedido.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* Coupon */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Cupón de descuento
                    </label>
                    {couponCode ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-medium">{couponCode}</span>
                          {couponType === "FREE_SHIPPING" ? (
                            <span className="text-xs text-green-600">— Envío gratis</span>
                          ) : (
                            <span className="text-xs text-green-600">— {formatPrice(couponDiscount)} off</span>
                          )}
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="ml-2 text-green-500 hover:text-green-800 transition-colors flex-shrink-0"
                          title="Quitar cupón"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                            placeholder="Ej: SOFIAS HN10"
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <button
                            onClick={applyCoupon}
                            disabled={couponLoading || !couponInput.trim()}
                            className="px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            {couponLoading ? "..." : "Aplicar"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                            <X className="w-3 h-3" /> {couponError}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                      Notas del pedido (opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Instrucciones especiales para la entrega..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                      <p className="text-sm text-red-600">{submitError}</p>
                      {submitError.includes("sesión") && (
                        <a href="/cuenta" className="text-xs text-red-700 underline mt-1 inline-block">
                          Iniciar sesión →
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-200 py-4 rounded-xl text-sm font-medium hover:bg-gray-50"
                    >
                      ← Volver
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        !formData.paymentMethod ||
                        (formData.paymentMethod === "card" &&
                          (!formData.cardNumber.trim() ||
                            !formData.cardName.trim() ||
                            !formData.cardExpiry.trim() ||
                            !formData.cardCVC.trim()))
                      }
                      className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? "Procesando..."
                        : `Confirmar Pedido — ${formatPrice(grandTotal)}${couponDiscount > 0 ? ` (ahorro ${formatPrice(couponDiscount)})` : ""}`}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h2>
                  <p className="text-gray-500 mb-4">Tu número de pedido es:</p>
                  <p className="text-xl font-bold bg-gray-100 inline-block px-6 py-3 rounded-xl mb-6">
                    {orderNumber}
                  </p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                    Recibirás confirmación con los detalles de tu pedido. ¡Gracias por comprar en SOFIAS HN!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => router.push("/")}
                      className="px-6 py-3 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50"
                    >
                      Ir al Inicio
                    </button>
                    <button
                      onClick={() => router.push("/catalogo")}
                      className="px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800"
                    >
                      Seguir Comprando
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Order summary */}
          {step < 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="font-semibold mb-4">Resumen del Pedido ({items.length} items)</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                        <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                        {item.color && (
                          <p className="text-[10px] text-gray-400">Color: {item.color.split("|")[0]}</p>
                        )}
                        {item.size && <p className="text-[10px] text-gray-400">Talla: {item.size}</p>}
                        <p className="text-xs font-semibold mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "GRATIS" : formatPrice(shipping)}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Descuento cupón</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
