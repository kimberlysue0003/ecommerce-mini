// Product service for backend API integration

import { fetchAPI } from '../config/api';
import type { Product } from '../types';

export async function getProducts(params?: {
  search?: string;
  tags?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append('search', params.search);
  if (params?.tags) queryParams.append('tags', params.tags);
  if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString();
  const endpoint = `/products${query ? `?${query}` : ''}`;

  const response = await fetchAPI(endpoint);
  return response.data as Product[];
}

export async function getProductById(id: string) {
  const response = await fetchAPI(`/products/${id}`);
  return response.data as Product;
}

export async function getProductBySlug(slug: string) {
  const response = await fetchAPI(`/products/slug/${slug}`);
  return response.data as Product;
}

export async function aiSearchProducts(query: string) {
  const response = await fetchAPI('/ai/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return response.data.results as Product[];
}
