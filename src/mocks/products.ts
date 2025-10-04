export type Product = {
  id: string; slug: string; title: string; price: number; image: string;
  tags: string[]; stock: number; rating: number;
};

export const products: Product[] = [
  { id: "1", slug: "bt-headset-01", title: "Bluetooth Headphones Pro", price: 49900,
    image: "https://picsum.photos/seed/a/400/300", tags:["headphones","bluetooth"], stock: 12, rating: 4.5 },
  { id: "2", slug: "mech-kb-01", title: "Mechanical Keyboard 87", price: 29900,
    image: "https://picsum.photos/seed/b/400/300", tags:["keyboard","mechanical"], stock: 5, rating: 4.2 },
  { id: "3", slug: "mouse-01", title: "Lightweight Gaming Mouse", price: 15900,
    image: "https://picsum.photos/seed/c/400/300", tags:["mouse"], stock: 20, rating: 4.1 },
  { id: "4", slug: "spk-01", title: "Desktop Speaker", price: 39900,
    image: "https://picsum.photos/seed/d/400/300", tags:["speaker"], stock: 8, rating: 4.3 },
  { id: "5", slug: "monitor-27", title: "27\" Monitor", price: 129900,
    image: "https://picsum.photos/seed/e/400/300", tags:["monitor"], stock: 6, rating: 4.6 },
  { id: "6", slug: "kb-60", title: "60% Compact Keyboard", price: 25900,
    image: "https://picsum.photos/seed/f/400/300", tags:["keyboard","mechanical"], stock: 10, rating: 4.0 },
];
