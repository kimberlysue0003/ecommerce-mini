import { useParams, Link } from "react-router-dom";
import { products } from "../mocks/products";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  if (!product) return <div>Product not found.</div>;

  const tagSet = new Set(product.tags);
  const similar = products
    .filter(p => p.id !== product.id)
    .map(p => ({ p, score: p.tags.filter(t=>tagSet.has(t)).length }))
    .filter(x => x.score > 0)
    .sort((a,b)=> b.score - a.score)
    .slice(0, 4)
    .map(x => x.p);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-12 gap-8">
        <img src={product.image} className="col-span-6 rounded-xl" />
        <div className="col-span-6">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-gray-500 mt-2">${(product.price/100).toFixed(2)}</p>
          <button className="mt-6 rounded-xl bg-black px-4 py-2 text-white">Add to Cart</button>
          <div className="mt-4 text-sm text-gray-500">
            Tags: {product.tags.join(", ")} · Stock: {product.stock}
          </div>
          <Link to="/" className="inline-block mt-4 text-blue-600">Back to catalog</Link>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-4">Similar products</h2>
        <div className="grid grid-cols-4 gap-6">
          {similar.length ? similar.map(p => <ProductCard key={p.id} product={p} />) : <div className="text-gray-500">No recommendations.</div>}
        </div>
      </div>
    </div>
  );
}
