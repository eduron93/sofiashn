"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    hours: Math.floor((diff / 1000 / 3600) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownBanner() {
  // Target: midnight tonight
  const [target] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTime(getTimeLeft(target));
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="bg-gray-900 text-white py-10 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Oferta del Día
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              Hasta <span className="text-rose-400">50% OFF</span><br />
              en Productos Seleccionados
            </h2>
            <p className="text-gray-400 mt-2 text-sm">Solo por tiempo limitado</p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-4">
            {[
              { label: "Horas", value: pad(time.hours) },
              { label: "Min", value: pad(time.minutes) },
              { label: "Seg", value: pad(time.seconds) },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-4">
                {i > 0 && <span className="text-2xl font-bold text-gray-500">:</span>}
                <div className="text-center">
                  <motion.div
                    key={unit.value}
                    initial={{ opacity: 0.5, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 rounded-xl px-4 py-3 min-w-[64px]"
                  >
                    <span className="text-3xl font-black tabular-nums">{unit.value}</span>
                  </motion.div>
                  <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider">
                    {unit.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/catalogo/ofertas"
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-colors whitespace-nowrap"
          >
            Ver Ofertas →
          </Link>
        </div>
      </div>
    </section>
  );
}
