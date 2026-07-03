import Link from "next/link";
import { ArrowRight, Clock, Tag, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog de Moda | SOFIAS HN",
  description: "Tendencias, consejos de estilo y novedades de moda en el blog de SOFIAS HN.",
};

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  image: string | null;
  publishedAt: Date | null;
  createdAt: Date;
}

async function getPosts(): Promise<Post[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.post.findMany({
      where: { isPublished: true },
      select: {
        id: true, slug: true, title: true, excerpt: true,
        category: true, image: true, publishedAt: true, createdAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-HN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-gray-400 uppercase mb-3">Inspiración & Estilo</p>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Blog SOFIAS HN</h1>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Tendencias, consejos y todo lo que necesitas saber sobre moda.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Próximamente</p>
            <p className="text-gray-400 text-sm mt-1">Estamos preparando contenido increíble para ti.</p>
          </div>
        ) : (
          <>
            {/* Post destacado */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-2">
                    {featured.image && (
                      <div className="aspect-video md:aspect-auto overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featured.image}
                          alt={featured.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Destacado
                        </span>
                        {featured.category && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {featured.category}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDate(featured.publishedAt ?? featured.createdAt)}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 group-hover:gap-2 transition-all">
                          Leer <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid de posts */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-6">
                {rest.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    {post.image && (
                      <div className="aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      {post.category && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            {post.category}
                          </span>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-gray-700 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                        <span className="text-xs font-semibold text-gray-900 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Leer <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
