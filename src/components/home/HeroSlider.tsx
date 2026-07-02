"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  buttonText: string | null;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "d1",
    title: "Nueva Colección\nPrimavera 2025",
    subtitle: "Descubre las últimas tendencias en moda femenina",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",
    link: "/catalogo/mujeres",
    buttonText: "Ver Colección",
  },
  {
    id: "d2",
    title: "Estilo Urbano\nMasculino",
    subtitle: "Looks modernos para el hombre contemporáneo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=80",
    link: "/catalogo/hombres",
    buttonText: "Explorar",
  },
  {
    id: "d3",
    title: "Hasta 50% OFF\nEn Calzado",
    subtitle: "Los mejores estilos al mejor precio",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80",
    link: "/catalogo/calzado",
    buttonText: "Ver Ofertas",
  },
];

export function HeroSlider({ initialSlides }: { initialSlides: Slide[] }) {
  const slides = initialSlides.length > 0 ? initialSlides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <div
      className="relative h-[85vh] min-h-[500px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-xl text-white"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight whitespace-pre-line tracking-tight">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
                <div className="flex gap-4 mt-8 flex-wrap">
                  {slide.link && (
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                      {slide.buttonText || "Ver más"}
                    </Link>
                  )}
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
                  >
                    Ver Todo
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
