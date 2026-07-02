import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: Date;
  user: { name: string; image: string | null };
  product: { name: string };
}

async function getReviews(): Promise<Review[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.review.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getStats(): Promise<{ avg: number; count: number }> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const stats = await prisma.review.aggregate({
      where: { isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { avg: stats._avg.rating ?? 0, count: stats._count.rating };
  } catch {
    return { avg: 0, count: 0 };
  }
}

export async function TestimonialsSection() {
  const [reviews, stats] = await Promise.all([getReviews(), getStats()]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-gray-500 mt-2">Opiniones reales de personas reales</p>
          {stats.count > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {stats.avg.toFixed(1)} de 5 basado en {stats.count.toLocaleString("es-HN")} reseñas
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 4).map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= r.rating ? "text-amber-400 fill-current" : "text-gray-200 fill-current"}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "{r.body || r.title || "Excelente producto."}"
              </p>
              <p className="text-xs text-gray-400 mb-4 italic">— {r.product.name}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {r.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.user.image} alt={r.user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                    {r.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.user.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("es-HN", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
