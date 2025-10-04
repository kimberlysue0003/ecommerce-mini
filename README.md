# 🛍️ E-commerce Full-Stack Demo

A production-ready **Full-Stack E-commerce Application** built by **Kimberly Su**, showcasing modern web development with **React + TypeScript** frontend, **Node.js + PostgreSQL** backend, **AI-powered search**, and complete **DevOps** setup.

**🎯 Built to demonstrate:** Senior Full-Stack Engineering capabilities with focus on TypeScript, REST/GraphQL APIs, Database Design, AI Integration, Docker, and CI/CD.

---

## 🚀 Tech Stack

### Frontend
- **React 19** + **TypeScript 5.7** + **Vite**
- **TailwindCSS 4** + **Framer Motion** (UI + animations)
- **React Router v7**
- **TanStack Query** (API data fetching)

### Backend
- **Node.js 20** + **TypeScript 5.7**
- **Express.js** (REST API)
- **GraphQL** (graphql-yoga)
- **PostgreSQL 16** + **Prisma ORM**
- **JWT Authentication** (jsonwebtoken)
- **Security:** helmet, CORS, rate-limiting

### AI Features (Free - No External APIs)
- **Rule-based NLP** query parsing
- **TF-IDF** content-based similarity
- **Collaborative Filtering** recommendations
- **User Behavior Tracking**

### DevOps & Infrastructure
- **Docker** + **Docker Compose**
- **GitHub Actions** CI/CD
- **Production-ready** deployment configs

---

## ✨ Key Features

### 🤖 AI-Powered Search
Natural language product search with intelligent parsing:
```
"wireless headphones under $100" → filters by keywords + price
"mechanical keyboard 300-600"    → price range filtering
"best rated monitors"            → sort by rating
```

### 🛒 Complete E-commerce Flow
- Product browsing with filters
- Shopping cart with quantity management
- User authentication (JWT)
- Order creation and tracking
- User behavior analytics

### 🔐 Security & Best Practices
- Password hashing (bcrypt)
- JWT token authentication
- Rate limiting (100 req/15min)
- CORS protection
- Input validation (Zod)
- SQL injection prevention (Prisma)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              http://localhost:5173                       │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │  Home    │ Product  │  Cart    │  AI Search       │  │
│  │  Page    │ Detail   │ Drawer   │  Component       │  │
│  └──────────┴──────────┴──────────┴──────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
                      ↓
┌─────────────────────────────────────────────────────────┐
│              Backend API (Node.js + Express)             │
│              http://localhost:3000                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  REST API        │  GraphQL      │  AI Services  │   │
│  │  /api/*          │  /graphql     │  NLP Parser   │   │
│  │                  │               │  TF-IDF       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │ Prisma ORM
                      ↓
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Docker)                   │
│              Port 5433                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Users │ Products │ Orders │ Cart │ Behaviors   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1: Full Stack with Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/your-username/ecommerce-mini.git
cd ecommerce-mini

# Start PostgreSQL
cd backend
docker run --name ecommerce-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ecommerce \
  -p 5433:5432 -d postgres:16-alpine

# Setup backend
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev  # Backend starts on port 3000

# In new terminal - Setup frontend
cd ..
npm install
npm run dev  # Frontend starts on port 5173
```

**Access:**
- 🌐 Frontend: http://localhost:5173
- 🔌 REST API: http://localhost:3000/api
- 🔮 GraphQL: http://localhost:3000/graphql

### Option 2: Docker Compose (One Command)

```bash
cd backend
docker-compose up -d
```

---

## 📡 API Documentation

### REST Endpoints

**Authentication**
```http
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login (get JWT token)
GET    /api/auth/me          # Get current user
```

**Products**
```http
GET    /api/products                  # List products (with filters)
GET    /api/products/:id              # Get by ID
GET    /api/products/slug/:slug       # Get by slug
```

**Cart** (Requires Authentication)
```http
GET    /api/cart              # Get user's cart
POST   /api/cart              # Add item
PUT    /api/cart/:itemId      # Update quantity
DELETE /api/cart/:itemId      # Remove item
```

**Orders** (Requires Authentication)
```http
POST   /api/orders            # Create order
GET    /api/orders            # Get user's orders
GET    /api/orders/:id        # Get order details
```

**AI Features**
```http
POST   /api/ai/search                # Natural language search
GET    /api/ai/recommend/:productId  # Similar products
GET    /api/ai/recommend/user        # Personalized (auth)
GET    /api/ai/popular               # Trending products
```

### GraphQL API

Endpoint: `/graphql`

**Sample Query:**
```graphql
query {
  products(limit: 10) {
    products {
      id
      title
      price
      rating
      tags
    }
    pagination {
      total
      totalPages
    }
  }
}
```

---

## 🧪 Demo Accounts

After running `npm run db:seed`:

**Email:** `demo@example.com`
**Password:** `demo123`

**Email:** `admin@example.com`
**Password:** `demo123`

---

## 📁 Project Structure

```
ecommerce-mini/
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API integration
│   │   ├── config/            # Configuration
│   │   ├── store/             # State management
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/            # Database, env config
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # REST routes
│   │   ├── graphql/           # GraphQL schema & resolvers
│   │   ├── middleware/        # Auth, validation, errors
│   │   ├── utils/             # Helpers (logger, similarity)
│   │   └── prisma/            # Database schema & seed
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .github/workflows/     # CI/CD pipeline
│   └── README.md              # Backend docs
│
└── README.md                  # This file
```

---

## 🤖 AI Features Explained

### 1. Natural Language Search
```javascript
// User input
"wireless headphones under 100"

// Parsed to
{
  keywords: ["wireless", "headphones"],
  maxPrice: 100,
  sortBy: "relevance"
}

// Backend executes smart search with scoring
relevance × 0.5 + rating × 0.3 + popularity × 0.2
```

### 2. Content-Based Recommendations (TF-IDF)
- Analyzes product titles and tags
- Calculates term frequency-inverse document frequency
- Uses cosine similarity for matching

### 3. Collaborative Filtering
- Tracks user behavior (VIEW, ADD_TO_CART, PURCHASE)
- Recommends based on similar user preferences
- No external AI APIs required

---

## 🛡️ Security Features

✅ **Password Hashing:** bcrypt (10 rounds)
✅ **JWT Authentication:** Secure token-based auth
✅ **HTTP Security Headers:** helmet.js
✅ **Rate Limiting:** 100 requests per 15 minutes
✅ **CORS Protection:** Configurable origins
✅ **Input Validation:** Zod schema validation
✅ **SQL Injection Prevention:** Prisma ORM

---

## 🚢 Deployment

### Backend Deployment (AWS/Railway/Render)

1. **Setup PostgreSQL database** (AWS RDS, Railway, etc.)
2. **Set environment variables:**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/db
   JWT_SECRET=your-secret-key-min-32-chars
   NODE_ENV=production
   ```
3. **Deploy:**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Update API URLs** in `.env`:
   ```bash
   VITE_API_URL=https://your-backend.com/api
   ```
2. **Deploy:**
   ```bash
   npm run build
   # Upload dist/ folder
   ```

### Docker Deployment

```bash
docker-compose up -d
```

---

## 🎯 Technical Highlights

This project demonstrates:

✅ **Full-Stack TypeScript** - End-to-end type safety
✅ **RESTful + GraphQL** - Dual API architecture
✅ **Database Design** - Normalized schema with Prisma
✅ **Authentication & Authorization** - JWT implementation
✅ **AI/ML Algorithms** - TF-IDF, collaborative filtering
✅ **Docker Containerization** - Production-ready setup
✅ **CI/CD Pipeline** - Automated testing & deployment
✅ **Security Best Practices** - Industry-standard measures
✅ **Clean Architecture** - Separation of concerns
✅ **Performance Optimization** - Caching, indexing

---

## 📚 Documentation

- **Backend API Docs:** [backend/README.md](./backend/README.md)
- **Quick Start Guide:** [backend/QUICKSTART.md](./backend/QUICKSTART.md)
- **Architecture Plan:** [backend/plan.md](./backend/plan.md)
- **Future Features:** [backend/bonus.md](./backend/bonus.md)

---

## 🔮 Future Enhancements

See [backend/bonus.md](./backend/bonus.md) for planned features:
- OpenAI GPT-4 integration
- Redis caching layer
- Elasticsearch full-text search
- Stripe payment gateway
- WebSocket real-time updates
- Admin dashboard
- Email notifications

---

## 👩‍💻 Author

**Kimberly Su**
Senior Full-Stack Engineer
14+ years experience in Game Dev, 3D/VR/AR & Web Engineering

📧 Contact: [Your Email]
🔗 LinkedIn: [Your LinkedIn]
💼 Portfolio: [Your Portfolio]

---

## 📄 License

MIT License - Feel free to use this project for learning or portfolio purposes!

---

## 🙏 Acknowledgments

Built to showcase:
- Modern full-stack development practices
- TypeScript proficiency across frontend and backend
- Database design and ORM usage
- RESTful and GraphQL API design
- AI/ML algorithm implementation (without paid services)
- DevOps and containerization skills
- Security best practices
- Clean code architecture

---

**⭐ Star this repo if you find it helpful!**

**🚀 Happy Coding!**
