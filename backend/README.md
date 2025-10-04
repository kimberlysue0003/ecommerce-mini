# 🛍️ E-Commerce Backend API

A production-ready, full-stack e-commerce backend built with **Node.js**, **TypeScript**, **PostgreSQL**, and **GraphQL**. Features include JWT authentication, AI-powered search, collaborative filtering recommendations, and comprehensive RESTful + GraphQL APIs.

Built by **Kimberly Su** to demonstrate modern backend development practices and full-stack integration capabilities.

---

## 🚀 Tech Stack

### Core Technologies
- **Runtime:** Node.js 20+ with TypeScript 5.7
- **Framework:** Express.js 4.21
- **Database:** PostgreSQL 16 with Prisma ORM 6.5
- **API:** RESTful + GraphQL (graphql-yoga)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt, helmet, express-rate-limit
- **Validation:** Zod

### DevOps & Infrastructure
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Testing:** Vitest
- **Development:** tsx (TypeScript execution)

### AI Features (Free - No External APIs)
- Rule-based NLP query parsing
- TF-IDF content-based similarity
- Collaborative filtering recommendations
- User behavior tracking

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── config/                  # Configuration files
│   │   ├── database.ts          # Prisma client setup
│   │   └── env.ts               # Environment validation
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Sample data seeding
│   ├── graphql/                 # GraphQL layer
│   │   ├── schema.ts            # Type definitions
│   │   ├── context.ts           # Request context
│   │   └── resolvers/           # GraphQL resolvers
│   ├── routes/                  # REST API routes
│   ├── controllers/             # Request handlers
│   ├── services/                # Business logic
│   ├── middleware/              # Express middleware
│   ├── types/                   # TypeScript types
│   └── utils/                   # Utility functions
├── Dockerfile                   # Production container
├── docker-compose.yml           # Local development setup
└── .github/workflows/ci.yml     # CI/CD pipeline
```

---

## 🔥 Quick Start

### Prerequisites
- **Node.js** 20 or higher
- **PostgreSQL** 16 (or use Docker)
- **npm** or **pnpm**

### Option 1: Docker (Recommended)

```bash
# Clone the repository
cd backend

# Copy environment variables
cp .env.example .env

# Start all services (PostgreSQL + Backend)
docker-compose up -d

# Run database migrations and seed data
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed

# View logs
docker-compose logs -f backend
```

**Access the API:**
- REST API: http://localhost:3000/api
- GraphQL Playground: http://localhost:3000/graphql
- Health Check: http://localhost:3000/health
- pgAdmin (optional): http://localhost:5050

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **Security Warning:** Always use strong, unique secrets in production!

---

## 📡 API Documentation

### REST API Endpoints

#### Authentication
```http
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login (returns JWT)
GET    /api/auth/me             # Get current user (requires auth)
```

#### Products
```http
GET    /api/products            # List all products (with filters)
GET    /api/products/:id        # Get product by ID
GET    /api/products/slug/:slug # Get product by slug
```

**Query Parameters for `/api/products`:**
- `search` - Text search in title/description
- `tags` - Comma-separated tags (e.g., `keyboard,wireless`)
- `minPrice` - Minimum price in dollars
- `maxPrice` - Maximum price in dollars
- `minRating` - Minimum rating (0-5)
- `inStock` - Only in-stock products (`true`/`false`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

#### Cart (Requires Authentication)
```http
GET    /api/cart                # Get user's cart
POST   /api/cart                # Add item to cart
PUT    /api/cart/:itemId        # Update quantity
DELETE /api/cart/:itemId        # Remove item
DELETE /api/cart                # Clear cart
```

#### Orders (Requires Authentication)
```http
POST   /api/orders              # Create order from cart
GET    /api/orders              # Get user's orders
GET    /api/orders/:id          # Get order details
```

#### AI Features
```http
POST   /api/ai/search           # Natural language product search
GET    /api/ai/recommend/:productId  # Similar products
GET    /api/ai/recommend/user   # Personalized recommendations (requires auth)
GET    /api/ai/popular          # Trending products
```

### GraphQL API

**Endpoint:** `/graphql`

#### Sample Queries

```graphql
# Get products with filters
query GetProducts {
  products(
    filter: { search: "keyboard", minPrice: 200, maxPrice: 500 }
    page: 1
    limit: 10
  ) {
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

# AI search
query AISearch {
  aiSearch(query: "wireless headphones under 100") {
    query
    results {
      id
      title
      price
    }
  }
}

# Get cart
query GetCart {
  cart {
    id
    quantity
    product {
      title
      price
    }
  }
}
```

#### Sample Mutations

```graphql
# Register
mutation Register {
  register(
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}

# Login
mutation Login {
  login(email: "demo@example.com", password: "demo123") {
    token
    user {
      email
    }
  }
}

# Add to cart
mutation AddToCart {
  addToCart(productId: "clx...", quantity: 2) {
    id
    quantity
    product {
      title
    }
  }
}

# Create order
mutation CreateOrder {
  createOrder {
    id
    total
    status
    items {
      quantity
      price
      product {
        title
      }
    }
  }
}
```

---

## 🤖 AI Features Explained

### 1. Natural Language Search
Parses queries like:
- "bluetooth headphones under $100" → `{ keywords: ["bluetooth", "headphones"], maxPrice: 100 }`
- "gaming mouse between 50 and 150" → `{ keywords: ["gaming", "mouse"], priceRange: [50, 150] }`
- "best rated keyboards" → `{ keywords: ["keyboard"], sortBy: "rating" }`

### 2. Content-Based Recommendations
Uses **TF-IDF** (Term Frequency-Inverse Document Frequency) to find similar products based on:
- Product title
- Product tags
- Cosine similarity between product vectors

### 3. Collaborative Filtering
Analyzes user behavior to recommend products:
- Tracks VIEW, ADD_TO_CART, and PURCHASE actions
- Weights purchases higher than views
- Recommends products with similar tags to user's history

### 4. Smart Ranking
Combined relevance score = `relevance × 0.5 + rating × 0.3 + popularity × 0.2`

---

## 🛡️ Security Features

✅ **Password Hashing:** bcrypt with 10 salt rounds
✅ **JWT Authentication:** Secure token-based auth
✅ **HTTP Security Headers:** helmet.js
✅ **Rate Limiting:** 100 requests per 15 minutes
✅ **CORS Protection:** Configurable allowed origins
✅ **Input Validation:** Zod schema validation
✅ **SQL Injection Prevention:** Prisma ORM

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild after code changes
docker-compose up -d --build

# Run migrations in container
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npm run db:seed

# Access database with psql
docker-compose exec postgres psql -U postgres -d ecommerce

# Start with pgAdmin
docker-compose --profile dev up -d
```

---

## 📊 Database Schema

### Key Models
- **User** - Authentication and profile
- **Product** - Product catalog
- **CartItem** - Shopping cart items
- **Order** - Completed orders
- **OrderItem** - Order line items
- **UserBehavior** - Behavior tracking for AI recommendations

### Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Push schema changes without migration
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Deploy to AWS (Example)

1. **Setup RDS PostgreSQL**
   ```bash
   # Create RDS instance via AWS Console or CLI
   # Update DATABASE_URL in production environment
   ```

2. **Deploy with Elastic Beanstalk / ECS / EC2**
   ```bash
   # Build Docker image
   docker build -t ecommerce-backend .

   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ecr-url>
   docker tag ecommerce-backend:latest <ecr-url>/ecommerce-backend:latest
   docker push <ecr-url>/ecommerce-backend:latest
   ```

3. **Run Migrations**
   ```bash
   # SSH into production server
   npx prisma migrate deploy
   npm run db:seed  # Only once for initial setup
   ```

### Deploy to Railway / Render / Fly.io

These platforms support automatic deployment from GitHub:

1. Connect your GitHub repository
2. Set environment variables
3. Platform auto-deploys on push to main branch

**Environment Variables to Set:**
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend-domain.com`

---

## 🔧 Development Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Run production build
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm test             # Run tests
```

---

## 📝 Demo Accounts

After seeding the database, you can use:

**Email:** `demo@example.com`
**Password:** `demo123`

**Email:** `admin@example.com`
**Password:** `demo123`

---

## 🎯 Roadmap & Future Features

See [bonus.md](./bonus.md) for planned enhancements:
- OpenAI GPT-4 integration
- Redis caching
- Elasticsearch full-text search
- Stripe payment gateway
- WebSocket real-time notifications
- Admin dashboard API

---

## 🤝 Contributing

This is a portfolio project, but feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for learning or your own portfolio!

---

## 👩‍💻 Author

**Kimberly Su**
Senior Full-Stack Engineer
14+ years experience in Game Dev, 3D/VR/AR & Web Engineering

---

## 🙏 Acknowledgments

- Built as a demonstration of modern full-stack development
- Integrates with existing React frontend ([../README.md](../README.md))
- Showcases TypeScript, Node.js, PostgreSQL, GraphQL, Docker, and CI/CD best practices

---

## 📞 Support

For issues or questions:
1. Check existing GitHub Issues
2. Create a new issue with detailed description
3. Include error logs and environment details

---

**Happy Coding! 🚀**
