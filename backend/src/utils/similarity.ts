// TF-IDF based similarity calculation for product recommendations
// Implements cosine similarity without external dependencies

import { Product } from '@prisma/client';
import { DocumentVector } from '../types/index.js';

/**
 * Tokenize text into words (lowercase, no punctuation)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Calculate term frequency for a document
 */
function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalTokens = tokens.length;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by document length
  for (const [term, count] of tf.entries()) {
    tf.set(term, count / totalTokens);
  }

  return tf;
}

/**
 * Calculate inverse document frequency
 */
function calculateIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const totalDocs = documents.length;

  // Count documents containing each term
  const docFrequency = new Map<string, number>();
  for (const doc of documents) {
    const uniqueTerms = new Set(doc);
    for (const term of uniqueTerms) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    }
  }

  // Calculate IDF
  for (const [term, df] of docFrequency.entries()) {
    idf.set(term, Math.log(totalDocs / df));
  }

  return idf;
}

/**
 * Calculate TF-IDF vector for a document
 */
function calculateTFIDF(tf: Map<string, number>, idf: Map<string, number>): Map<string, number> {
  const tfidf = new Map<string, number>();

  for (const [term, termFreq] of tf.entries()) {
    const idfValue = idf.get(term) || 0;
    tfidf.set(term, termFreq * idfValue);
  }

  return tfidf;
}

/**
 * Calculate vector magnitude
 */
function vectorMagnitude(vector: Map<string, number>): number {
  let sumSquares = 0;
  for (const value of vector.values()) {
    sumSquares += value * value;
  }
  return Math.sqrt(sumSquares);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
  let dotProduct = 0;

  // Calculate dot product
  for (const [term, value1] of vec1.entries()) {
    const value2 = vec2.get(term);
    if (value2 !== undefined) {
      dotProduct += value1 * value2;
    }
  }

  const mag1 = vectorMagnitude(vec1);
  const mag2 = vectorMagnitude(vec2);

  if (mag1 === 0 || mag2 === 0) return 0;

  return dotProduct / (mag1 * mag2);
}

/**
 * Build TF-IDF vectors for all products
 */
export function buildProductVectors(products: Product[]): Map<string, DocumentVector> {
  // Prepare documents
  const documents = products.map(p => {
    const text = `${p.title} ${p.tags.join(' ')}`;
    return tokenize(text);
  });

  // Calculate IDF
  const idf = calculateIDF(documents);

  // Build vectors
  const vectors = new Map<string, DocumentVector>();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const tokens = documents[i];
    const tf = calculateTF(tokens);
    const tfidf = calculateTFIDF(tf, idf);

    vectors.set(product.id, {
      productId: product.id,
      vector: tfidf,
      magnitude: vectorMagnitude(tfidf),
    });
  }

  return vectors;
}

/**
 * Find similar products using cosine similarity
 */
export function findSimilarProducts(
  targetProductId: string,
  products: Product[],
  limit = 5
): Array<{ productId: string; similarity: number }> {
  const vectors = buildProductVectors(products);
  const targetVector = vectors.get(targetProductId);

  if (!targetVector) {
    return [];
  }

  const similarities: Array<{ productId: string; similarity: number }> = [];

  for (const [productId, vector] of vectors.entries()) {
    if (productId === targetProductId) continue;

    const similarity = cosineSimilarity(targetVector.vector, vector.vector);
    similarities.push({ productId, similarity });
  }

  // Sort by similarity and return top results
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Calculate similarity score for search query
 */
export function calculateQuerySimilarity(query: string, product: Product): number {
  const queryTokens = tokenize(query);
  const productText = `${product.title} ${product.tags.join(' ')}`;
  const productTokens = tokenize(productText);

  // Simple overlap coefficient
  const querySet = new Set(queryTokens);
  const productSet = new Set(productTokens);

  let matches = 0;
  for (const token of querySet) {
    if (productSet.has(token)) {
      matches++;
    }
  }

  return matches / Math.max(querySet.size, 1);
}
