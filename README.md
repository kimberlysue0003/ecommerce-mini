# 🛍️ E-commerce Mini Demo

A lightweight **React + TypeScript** e-commerce showcase built by **Kimberly Su**, demonstrating front-end architecture, AI-powered search, and an interactive shopping cart — all within a week’s scope.

This version runs **fully client-side** (no backend yet) and highlights clean UI, modular code, and extendable design for future full-stack integration.

---

## 🚀 Tech Stack

**Frontend**
- React 18 + TypeScript + Vite  
- TailwindCSS + Framer Motion (UI + animations)  
- React Router v6  
- TanStack Query (future-ready for API data fetching)

**State & Logic**
- Custom Cart Store (Context + Reducer + localStorage persistence)  
- Rule-based “AI Search” for natural language parsing  
- Reusable Components with clean TypeScript types  

---

## 🧠 AI Search (Rule-based NLP)

The search bar accepts **natural language queries** and converts them into structured filters:

| Example Query | Parsed Result |
|----------------|----------------|
| `bluetooth headphones under $100` | keywords: bluetooth, price ≤ 100 |
| `keyboard 300-600` | price range: 300–600 |
| `over 200 webcam` | price ≥ 200, keyword: webcam |
| `between 50 and 150 mouse` | range + keyword |

### How it works
1. A lightweight parser (`src/lib/ai.ts`) tokenizes price-related expressions.  
2. Generates `{ text, priceMin, priceMax }` filters.  
3. Filters product list locally (client-side simulation of semantic search).  

This mimics an AI-driven UX, and can later be upgraded to:
- Query rewriting via OpenAI API  
- Semantic product retrieval with embeddings  
- Personalized recommendation (based on user events)

---

## 🛒 Shopping Cart (Client-Side)

- Add to Cart from any product card  
- Adjust quantity / remove item inside the cart drawer  
- Subtotal auto-calculation  
- Data persisted in `localStorage`  
- Mock checkout button (`Checkout (mock)`)

All cart state is managed with a `useReducer` + Context pattern:
`src/store/cart.tsx`

---

## 📁 Project Structure

```text
src/
 ├── components/
 │    ├── Navbar.tsx
 │    ├── AISearchBar.tsx
 │    ├── ProductCard.tsx
 │    ├── CartDrawer.tsx
 │    └── Filters.tsx
 │
 ├── pages/
 │    ├── Home.tsx
 │    └── ProductDetail.tsx
 │
 ├── store/
 │    └── cart.tsx
 │
 ├── lib/
 │    └── ai.ts
 │
 ├── mocks/
 │    └── products.ts
 │
 ├── App.tsx
 └── main.tsx

---

## 💡 Planned Extensions (Next Phase)

- **Backend API** — Node.js (Fastify) + Prisma + PostgreSQL  
- **User Auth & Orders** — JWT login, checkout pipeline  
- **AI Assistant API** — OpenAI query interpretation + recommendations  
- **Deployment** — Frontend on Vercel, Backend on Railway  

---

## 🖥️ How to Run Locally

```bash
git clone https://github.com/<your-username>/ecommerce-mini.git
cd ecommerce-mini
npm install
npm run dev


Visit http://localhost:5173
 🚀

✨ Author
Kimberly Su
Senior Frontend / Full-Stack Engineer
14+ years experience in Game Dev, 3D/VR/AR & Web Engineering
