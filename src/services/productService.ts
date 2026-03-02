import api, { USE_MOCK } from './api';
import { mockProducts } from '@/mock/products';
import type { Product } from '@/types';

type ApiProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  image?: string;
  roastLevel?: Product['roastLevel'];
  origin?: string;
  weight?: number;
  notes?: string[];
  createdAt?: string;
};

type ProductsApiResponse = {
  success: boolean;
  products: ApiProduct[];
};

function normalizeProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: product.imageUrl ?? product.image ?? '',
    roastLevel: product.roastLevel ?? 'medium',
    origin: product.origin ?? 'Origen no especificado',
    weight: product.weight ?? 340,
    notes: product.notes ?? [],
  };
}

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCK) return Promise.resolve(mockProducts);
  const { data } = await api.get<Product[] | ProductsApiResponse>('/products');
  const products = Array.isArray(data) ? data : data.products;
  return products.map(normalizeProduct);
}

export async function getProductById(id: string): Promise<Product> {
  if (USE_MOCK) {
    const product = mockProducts.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return Promise.resolve(product);
  }
  const { data } = await api.get<ApiProduct>(`/products/${id}`);
  return normalizeProduct(data);
}
