import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.post.findUnique({
      where: { slug, isPublished: true },
      select: {
        title: true, slug: true, excerpt: true, content: true,
        image: true, category: true, publishedAt: true, createdAt: true,
      },
    });
  } catch {
    return null;
  }
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero imagen */}
      {post.image && (
        <div className="relative h-72 sm:h-96 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className={`max-w-2xl mx-auto px-4 sm:px-6 ${post.image ? "-mt-16 relative" : "mt-12"} pb-20`}>
        <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-10">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-5 text-xs text-gray-400 flex-wrap">
            {post.category && (
              <span className="bg-gray-100 text-gray-700 font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> {post.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-8">
            {post.title}
          </h1>

          {/* Contenido */}
          <div className="space-y-5 text-gray-600 text-sm leading-relaxed">
            {paragraphs.map((p, i) => {
              if (p.startsWith("**") && p.endsWith("**")) {
                return <h3 key={i} className="font-bold text-gray-900 text-base mt-6">{p.replace(/\*\*/g, "")}</h3>;
              }
              if (p.includes("**")) {
                const parts = p.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i}>
                    {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-gray-900">{part}</strong> : part)}
                  </p>
                );
              }
              if (p.match(/^\d+\./m)) {
                return (
                  <ol key={i} className="list-decimal list-inside space-y-1 pl-2">
                    {p.split("\n").filter(Boolean).map((line, j) => (
                      <li key={j} className="text-gray-600">{line.replace(/^\d+\.\s*/, "")}</li>
                    ))}
                  </ol>
                );
              }
              return <p key={i}>{p}</p>;
            })}
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al blog
            </Link>
            <Link href="/catalogo" className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
