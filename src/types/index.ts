export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  features: string[];
  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: Date;
  category?: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface FilterState {
  category?: string;
  subcategory?: string;
  brand?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
  page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
