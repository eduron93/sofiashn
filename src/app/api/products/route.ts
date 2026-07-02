import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0") || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999") || 999999;
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "";
    const pageSize = 20;

    const where: any = {
      isActive: true,
      price: { gte: minPrice, lte: maxPrice },
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (filter === "new") where.isNew = true;
    if (filter === "bestseller") where.isBestSeller = true;
    if (filter === "featured") where.isFeatured = true;

    const orderBy: any = (() => {
      switch (sort) {
        case "price_asc": return { price: "asc" };
        case "price_desc": return { price: "desc" };
        case "newest": return { createdAt: "desc" };
        case "bestseller": return { salesCount: "desc" };
        case "rating": return { rating: "desc" };
        case "discount": return { comparePrice: "desc" };
        default: return { salesCount: "desc" };
      }
    })();

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, brand: true, subcategory: true },
        orderBy,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, pageSize });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ products: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, description, features, price, comparePrice, stock, sku, categoryId, brandId, images, sizes, colors, isActive, isFeatured, isNew, isBestSeller } = body;

    if (!name?.trim() || name.length > 200) return NextResponse.json({ error: "Nombre inválido (máx 200 caracteres)" }, { status: 400 });
    if (!categoryId || typeof categoryId !== "string") return NextResponse.json({ error: "Categoría requerida" }, { status: 400 });
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    if (comparePrice && (isNaN(parseFloat(comparePrice)) || parseFloat(comparePrice) < 0)) return NextResponse.json({ error: "Precio de comparación inválido" }, { status: 400 });
    if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) return NextResponse.json({ error: "Stock inválido" }, { status: 400 });
    if (sku && !/^[a-zA-Z0-9_-]{1,50}$/.test(sku)) return NextResponse.json({ error: "SKU inválido (alfanumérico, máx 50)" }, { status: 400 });
    if (!Array.isArray(images)) return NextResponse.json({ error: "Imágenes inválidas" }, { status: 400 });
    if (!Array.isArray(sizes)) return NextResponse.json({ error: "Tallas inválidas" }, { status: 400 });
    if (!Array.isArray(colors)) return NextResponse.json({ error: "Colores inválidos" }, { status: 400 });

    const slug = name
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    // garantizar slug único
    const existing = await prisma.product.count({ where: { slug: { startsWith: slug } } });
    const uniqueSlug = existing > 0 ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim() || null,
        features: Array.isArray(features) ? features.filter((f: unknown) => typeof f === "string" && f.trim()) : [],
        price: numPrice,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock) || 0,
        sku: sku || null,
        categoryId,
        brandId: brandId || null,
        images: images ?? [],
        sizes: sizes ?? [],
        colors: colors ?? [],
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? true,
        isBestSeller: isBestSeller ?? false,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un producto con ese SKU" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 });
  }
}
