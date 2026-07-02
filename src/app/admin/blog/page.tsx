export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { BlogClient } from "./BlogClient";

export const metadata: Metadata = { title: "Blog" };

async function getPosts() {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminBlogPage() {
  const posts = await getPosts();
  return <BlogClient posts={posts as any[]} />;
}
