// Product service for backend API integration

import { fetchAPI } from '../config/api';
import type { Product } from '../types';

function unwrapData<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function unwrapResults<T>(response: unknown): T {
  if (response && typeof response === 'object') {
    const resultObject = response as { results?: T; data?: unknown };

    if (Array.isArray(resultObject.results) || resultObject.results) {
      return resultObject.results as T;
    }

    if (resultObject.data && typeof resultObject.data === 'object' && 'results' in (resultObject.data as Record<string, unknown>)) {
      return (resultObject.data as { results: T }).results;
    }
  }

  return response as T;
}

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
  return unwrapData<Product[]>(response);
}

export async function getProductById(id: string) {
  const response = await fetchAPI(`/products/${id}`);
  return unwrapData<Product>(response);
}

export async function getProductBySlug(slug: string) {
  const response = await fetchAPI(`/products/slug/${slug}`);
  return unwrapData<Product>(response);
}

export async function aiSearchProducts(query: string) {
  const response = await fetchAPI('/ai/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return unwrapResults<Product[]>(response);
}
