"use client";

import { motion } from "framer-motion";
import { Truck, Shield, HeadphonesIcon, RefreshCw } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Envío Rápido",
    desc: "Entrega en 2-5 días hábiles",
  },
  {
    icon: Shield,
    title: "Pago Seguro",
    desc: "Tus datos siempre protegidos",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte 24/7",
    desc: "Atención personalizada",
  },
  {
    icon: RefreshCw,
    title: "30 Días de Garantía",
    desc: "Devoluciones sin complicaciones",
  },
];

export function BenefitsBar() {
  return (
    <section className="border-y border-gray-100 bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
