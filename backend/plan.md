# 🎯 Backend Implementation Plan

## Project Overview
Full-stack e-commerce backend showcasing modern development practices, designed to integrate with the existing React frontend.

---

## 🛠️ Technology Stack

### Core Technologies
- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Express.js (RESTful APIs)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **API Layer:** REST + GraphQL (graphql-yoga)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt, helmet, express-rate-limit
- **Validation:** Zod

### DevOps & Deployment
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Testing:** Vitest
- **Development:** tsx (TypeScript execution)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── config/
│   │   ├── database.ts          # Database configuration
│   │   └── env.ts               # Environment variable validation
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   └── seed.ts              # Database seed script
│   ├── graphql/
│   │   ├── schema.ts            # GraphQL schema
│   │   ├── resolvers/           # GraphQL resolvers
│   │   │   ├── product.resolver.ts
│   │   │   ├── auth.resolver.ts
│   │   │   ├── cart.resolver.ts
│   │   │   └── order.resolver.ts
│   │   └── context.ts           # GraphQL context
│   ├── routes/
│   │   ├── products.ts          # Product REST API
│   │   ├── auth.ts              # Authentication API
│   │   ├── cart.ts              # Shopping cart API
│   │   ├── orders.ts            # Order management API
│   │   └── ai.ts                # AI search/recommendation API
│   ├── controllers/
│   │   ├── product.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── auth.service.ts      # Authentication logic
│   │   ├── ai.service.ts        # AI search & recommendations
│   │   ├── product.service.ts   # Product business logic
│   │   └── recommendation.ts    # Recommendation algorithms
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── error.middleware.ts  # Error handling
│   │   └── validation.ts        # Request validation
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       ├── logger.ts            # Logging utility
│       ├── responses.ts         # Unified API responses
│       └── similarity.ts        # TF-IDF similarity calculation
├── tests/                       # Unit and integration tests
├── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml               # CI/CD configuration
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── plan.md                      # This file
└── bonus.md                     # Future features roadmap
```

---

## 🗄️ Database Schema (Prisma)

### Models
1. **User**
   - id, email, password (hashed), name
   - Relations: orders, cart items
   - Timestamps: createdAt, updatedAt

2. **Product**
   - id, slug, title, price, tags, stock, rating
   - description (optional)
   - imageUrl (optional)
   - Relations: cart items, order items

3. **CartItem**
   - id, userId, productId, quantity
   - Relations: user, product

4. **Order**
   - id, userId, total, status
   - Relations: user, order items
   - Timestamps: createdAt, updatedAt

5. **OrderItem**
   - id, orderId, productId, quantity, price
   - Relations: order, product

6. **UserBehavior** (for AI recommendations)
   - id, userId, productId, action (view/addToCart/purchase)
   - Timestamps: createdAt

---

## 🔌 API Endpoints

### RESTful APIs

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/auth/me` - Get current user (requires auth)

#### Products
- `GET /api/products` - List products (with filters, pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug

#### Cart
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart` - Add item to cart (requires auth)
- `PUT /api/cart/:itemId` - Update cart item quantity (requires auth)
- `DELETE /api/cart/:itemId` - Remove item from cart (requires auth)
- `DELETE /api/cart` - Clear cart (requires auth)

#### Orders
- `POST /api/orders` - Create order from cart (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order details (requires auth)

#### AI Features
- `POST /api/ai/search` - AI-powered product search
- `GET /api/ai/recommend/:productId` - Get similar products
- `GET /api/ai/recommend/user` - Get personalized recommendations (requires auth)

### GraphQL API

**Endpoint:** `/graphql`

#### Queries
```graphql
type Query {
  products(filter: ProductFilter, limit: Int, offset: Int): ProductsResponse!
  product(id: ID!): Product
  productBySlug(slug: String!): Product
  me: User
  cart: [CartItem!]!
  orders: [Order!]!
  order(id: ID!): Order
  aiSearch(query: String!): [Product!]!
  recommendations(productId: ID): [Product!]!
}
```

#### Mutations
```graphql
type Mutation {
  register(email: String!, password: String!, name: String): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  addToCart(productId: ID!, quantity: Int!): CartItem!
  updateCartItem(itemId: ID!, quantity: Int!): CartItem!
  removeFromCart(itemId: ID!): Boolean!
  clearCart: Boolean!
  createOrder: Order!
}
```

---

## 🤖 Free AI Features

### 1. Enhanced Rule-based NLP Search
- Parse natural language queries
- Extract keywords, price ranges, filters
- Support patterns:
  - "bluetooth headphones under 100"
  - "gaming mouse between 50 and 150"
  - "best rated keyboards"

### 2. Collaborative Filtering Recommendations
- **User-based:** Users who bought X also bought Y
- **Item-based:** Products similar to X based on tags and price
- **Popularity-based:** Top rated and most purchased

### 3. TF-IDF Vector Similarity
- Calculate similarity between products
- Based on title + tags
- No external APIs required
- Completely local computation

### 4. Smart Ranking Algorithm
- Combined score = relevance × 0.5 + rating × 0.3 + popularity × 0.2
- Configurable weights

---

## 🔒 Security Features

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - Minimum password requirements

2. **JWT Authentication**
   - Secure token generation
   - Expiration handling
   - Refresh token support (optional)

3. **HTTP Security Headers** (helmet)
   - XSS protection
   - CSRF protection
   - Content security policy

4. **Rate Limiting**
   - 100 requests per 15 minutes (default)
   - Configurable per endpoint

5. **CORS Configuration**
   - Whitelist frontend origin
   - Credentials support

6. **Input Validation**
   - Zod schema validation
   - SQL injection prevention (Prisma)
   - XSS sanitization

---

## 🐳 Docker Configuration

### Services
1. **PostgreSQL** (port 5432)
   - Volume for data persistence
   - Initial database creation

2. **Backend API** (port 3000)
   - Built from Dockerfile
   - Environment variables from .env
   - Depends on PostgreSQL

3. **pgAdmin** (optional, port 5050)
   - Database management UI

---

## 🚀 CI/CD Pipeline (GitHub Actions)

### Workflow Triggers
- Push to main branch
- Pull requests

### Steps
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run linter (ESLint)
5. Run type check (tsc)
6. Run tests (Vitest)
7. Build application
8. (Optional) Deploy to staging/production

---

## 📝 Implementation Checklist

### Phase 1: Project Setup
- [ ] Initialize package.json with dependencies
- [ ] Configure TypeScript
- [ ] Setup .env.example and .gitignore
- [ ] Create project folder structure

### Phase 2: Database Layer
- [ ] Define Prisma schema
- [ ] Create database migrations
- [ ] Write seed script with sample data
- [ ] Setup database connection

### Phase 3: Core Backend
- [ ] Create Express server entry point
- [ ] Setup middleware (CORS, helmet, rate-limit)
- [ ] Implement error handling middleware
- [ ] Create utility functions (logger, responses)

### Phase 4: Authentication
- [ ] Implement JWT service
- [ ] Create auth middleware
- [ ] Build auth controller & routes
- [ ] Add input validation

### Phase 5: Product APIs
- [ ] Product controller & service
- [ ] REST endpoints for products
- [ ] Filtering and pagination logic

### Phase 6: Cart & Orders
- [ ] Cart controller & routes
- [ ] Order creation logic
- [ ] Order history endpoints

### Phase 7: AI Features
- [ ] Enhanced NLP query parser
- [ ] TF-IDF similarity calculation
- [ ] Collaborative filtering algorithm
- [ ] Recommendation service
- [ ] AI endpoints

### Phase 8: GraphQL
- [ ] Define GraphQL schema
- [ ] Implement resolvers
- [ ] Setup GraphQL Yoga server
- [ ] Integrate with existing services

### Phase 9: Docker & DevOps
- [ ] Write Dockerfile
- [ ] Create docker-compose.yml
- [ ] Test local Docker deployment
- [ ] Setup GitHub Actions workflow

### Phase 10: Documentation
- [ ] Write comprehensive README
- [ ] API documentation
- [ ] Deployment guide
- [ ] Environment variable reference

---

## 🎯 Success Criteria

✅ **Functional Requirements**
- All REST and GraphQL endpoints working
- JWT authentication functioning
- Database operations (CRUD) successful
- AI search and recommendations operational

✅ **Technical Requirements**
- TypeScript with strict mode
- Full type safety across codebase
- Error handling and validation
- Security best practices implemented

✅ **DevOps Requirements**
- Docker one-command deployment
- CI/CD pipeline passing
- Environment-based configuration
- Easy setup for other developers

✅ **Documentation**
- Clear README with setup instructions
- API endpoint documentation
- Architecture overview
- Deployment guide for AWS/GCP/Azure

---

## 📚 References & Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Created:** 2025-10-04
**Author:** Kimberly Su
**Status:** Ready for Implementation
