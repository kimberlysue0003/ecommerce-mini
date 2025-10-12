# 🔄 Backend Migration Plan: Node.js → Go

## 📋 Project Overview

**Goal:** Migrate the e-commerce backend from Node.js/TypeScript to Go while maintaining production stability.

**Strategy:** Create a new Git branch with parallel backend implementation, test thoroughly, then gradually switch traffic.

---

## 🎯 Migration Benefits

### Why Go?
- ✅ **Performance:** 3-5x faster than Node.js for API requests
- ✅ **Memory Efficiency:** ~20-30MB vs Node.js ~100MB
- ✅ **Deployment:** Single binary file (no node_modules)
- ✅ **Concurrency:** Native goroutines for high-traffic handling
- ✅ **Type Safety:** Compile-time error detection
- ✅ **Cloud Native:** Perfect for Docker + AWS EC2

---

## 📁 Project Structure

```
ecommerce-mini/
├── frontend/                    # Frontend (no changes)
│   ├── src/
│   └── package.json
│
├── backend/                     # Original Node.js backend (keep as reference)
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── backend-go/                  # New Go backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go         # Application entry point
│   ├── internal/
│   │   ├── config/             # Configuration (env, database)
│   │   ├── handlers/           # HTTP handlers (controllers)
│   │   ├── services/           # Business logic
│   │   ├── models/             # GORM models
│   │   ├── middleware/         # Auth, CORS, rate limiting
│   │   ├── utils/              # Helpers (logger, responses)
│   │   └── graphql/            # GraphQL schema & resolvers
│   ├── pkg/                    # Public libraries (if needed)
│   ├── migrations/             # SQL migrations
│   ├── go.mod                  # Go dependencies
│   ├── go.sum
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml          # Updated for dual backend
├── go-migrate-plan.md          # This file
└── README.md
```

---

## 🔧 Technology Stack Mapping

| Component | Node.js (Current) | Go (Target) |
|-----------|-------------------|-------------|
| **Runtime** | Node.js 20 | Go 1.22+ |
| **Web Framework** | Express.js | Gin (or Fiber) |
| **ORM** | Prisma | GORM |
| **Database** | PostgreSQL 16 | PostgreSQL 16 (unchanged) |
| **GraphQL** | graphql-yoga | gqlgen |
| **Auth** | jsonwebtoken | golang-jwt/jwt |
| **Password** | bcrypt | bcrypt (crypto/bcrypt) |
| **Validation** | Zod | go-playground/validator |
| **Env** | dotenv | godotenv |
| **HTTP Client** | node-fetch | net/http |
| **Stripe** | stripe-node | stripe-go |
| **CORS** | cors | gin-cors |
| **Rate Limit** | express-rate-limit | gin-limiter |

---

## 📦 Go Dependencies

```go
// go.mod
module github.com/kimberlysue0003/ecommerce-mini/backend-go

go 1.22

require (
    github.com/gin-gonic/gin v1.10.0              // Web framework
    gorm.io/gorm v1.25.7                          // ORM
    gorm.io/driver/postgres v1.5.6                // PostgreSQL driver
    github.com/golang-jwt/jwt/v5 v5.2.0           // JWT auth
    golang.org/x/crypto v0.19.0                   // bcrypt
    github.com/joho/godotenv v1.5.1               // Load .env
    github.com/go-playground/validator/v10 v10.19.0  // Validation
    github.com/stripe/stripe-go/v76 v76.0.0       // Stripe payment
    github.com/99designs/gqlgen v0.17.44          // GraphQL
)
```

---

## 🗄️ Database Models (Prisma → GORM)

### User Model
```go
// internal/models/user.go
type User struct {
    ID        string    `gorm:"primaryKey;type:varchar(30)" json:"id"`
    Email     string    `gorm:"uniqueIndex;not null" json:"email"`
    Password  string    `gorm:"not null" json:"-"`
    Name      *string   `json:"name"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

    // Relations
    CartItems     []CartItem     `gorm:"foreignKey:UserID" json:"cartItems,omitempty"`
    Orders        []Order        `gorm:"foreignKey:UserID" json:"orders,omitempty"`
    UserBehaviors []UserBehavior `gorm:"foreignKey:UserID" json:"-"`
}
```

### Product Model
```go
// internal/models/product.go
type Product struct {
    ID          string    `gorm:"primaryKey;type:varchar(30)" json:"id"`
    Slug        string    `gorm:"uniqueIndex;not null" json:"slug"`
    Title       string    `gorm:"not null" json:"title"`
    Description *string   `json:"description"`
    Price       int       `gorm:"not null" json:"price"` // cents
    Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
    Stock       int       `gorm:"default:0" json:"stock"`
    Rating      float64   `gorm:"default:0" json:"rating"`
    ImageURL    *string   `json:"imageUrl"`
    CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

    // Relations
    CartItems  []CartItem  `gorm:"foreignKey:ProductID" json:"-"`
    OrderItems []OrderItem `gorm:"foreignKey:ProductID" json:"-"`
    Behaviors  []UserBehavior `gorm:"foreignKey:ProductID" json:"-"`
}
```

---

## 🚀 API Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

#### Tasks:
- [x] Create Git branch: `backend/go-refactor`
- [ ] Initialize Go module
- [ ] Setup project structure
- [ ] Configure environment variables (.env)
- [ ] Setup GORM + PostgreSQL connection
- [ ] Create database models
- [ ] Implement logger utility
- [ ] Create response helpers
- [ ] Setup Gin server with middleware:
  - CORS
  - Helmet (security headers)
  - Rate limiting
  - Error handling

#### Files to Create:
```
backend-go/
├── cmd/api/main.go
├── internal/
│   ├── config/database.go
│   ├── config/env.go
│   ├── models/user.go
│   ├── models/product.go
│   ├── models/cart.go
│   ├── models/order.go
│   ├── middleware/cors.go
│   ├── middleware/auth.go
│   └── utils/logger.go
├── go.mod
└── .env.example
```

---

### Phase 2: Authentication (Week 1)

#### Tasks:
- [ ] Implement JWT generation & verification
- [ ] Create auth middleware
- [ ] Build auth handlers:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- [ ] Password hashing (bcrypt)
- [ ] Input validation

#### Files:
```
internal/
├── services/auth_service.go
├── handlers/auth_handler.go
├── middleware/auth.go
└── utils/jwt.go
```

---

### Phase 3: Product API (Week 1-2)

#### Tasks:
- [ ] Product service layer
- [ ] Product handlers:
  - `GET /api/products` (with filters, pagination)
  - `GET /api/products/:id`
  - `GET /api/products/slug/:slug`
- [ ] Search & filtering logic
- [ ] Sorting implementation

#### Files:
```
internal/
├── services/product_service.go
└── handlers/product_handler.go
```

---

### Phase 4: Cart API (Week 2)

#### Tasks:
- [ ] Cart service layer
- [ ] Cart handlers:
  - `GET /api/cart`
  - `POST /api/cart`
  - `PUT /api/cart/:itemId`
  - `DELETE /api/cart/:itemId`
- [ ] Auth-required middleware

#### Files:
```
internal/
├── services/cart_service.go
└── handlers/cart_handler.go
```

---

### Phase 5: Order API (Week 2)

#### Tasks:
- [ ] Order service layer
- [ ] Order handlers:
  - `POST /api/orders`
  - `GET /api/orders`
  - `GET /api/orders/:id`
- [ ] Order status management

#### Files:
```
internal/
├── services/order_service.go
└── handlers/order_handler.go
```

---

### Phase 6: Payment Integration (Week 2)

#### Tasks:
- [ ] Stripe SDK integration
- [ ] Payment handlers:
  - `POST /api/payment/create-payment-intent`
  - `POST /api/payment/confirm`
- [ ] Order creation on successful payment

#### Files:
```
internal/
├── services/payment_service.go
└── handlers/payment_handler.go
```

---

### Phase 7: AI Features (Week 2-3)

#### Tasks:
- [ ] NLP query parser (port from Node.js)
- [ ] TF-IDF similarity algorithm
- [ ] AI handlers:
  - `POST /api/ai/search`
  - `GET /api/ai/recommend/:productId`
  - `GET /api/ai/recommend/user`
  - `GET /api/ai/popular`
- [ ] User behavior tracking

#### Files:
```
internal/
├── services/ai_service.go
├── handlers/ai_handler.go
└── utils/similarity.go
```

---

### Phase 8: GraphQL API (Week 3)

#### Tasks:
- [ ] Setup gqlgen
- [ ] Define GraphQL schema
- [ ] Implement resolvers:
  - Auth resolvers
  - Product resolvers
  - Cart resolvers
  - Order resolvers
  - AI resolvers
- [ ] GraphQL context with auth

#### Files:
```
internal/graphql/
├── schema.graphql
├── resolver.go
├── generated/
└── model/
```

---

### Phase 9: Testing (Week 3)

#### Tasks:
- [ ] Unit tests for services
- [ ] Integration tests for handlers
- [ ] Test database setup
- [ ] Test coverage report

#### Files:
```
internal/
├── services/auth_service_test.go
├── services/product_service_test.go
├── handlers/auth_handler_test.go
└── testutils/database.go
```

---

### Phase 10: Docker & Deployment (Week 3)

#### Tasks:
- [ ] Create Dockerfile
- [ ] Update docker-compose.yml (dual backend)
- [ ] Environment configuration
- [ ] Build & test Docker image
- [ ] AWS EC2 deployment script
- [ ] Nginx configuration update

#### Files:
```
backend-go/
├── Dockerfile
├── .dockerignore
└── deploy.sh
```

---

## 🔄 Git Workflow

### Branch Strategy

```bash
# Main branch (production - unchanged)
main

# Development branch for Go backend
backend/go-refactor
  ├── feature/go-setup
  ├── feature/go-auth
  ├── feature/go-products
  ├── feature/go-cart
  ├── feature/go-orders
  ├── feature/go-payment
  ├── feature/go-ai
  └── feature/go-graphql
```

### Commands

```bash
# Create main refactor branch
git checkout -b backend/go-refactor

# Create feature branches
git checkout -b feature/go-setup
# ... work on setup
git add .
git commit -m "setup: initialize Go project structure"
git push origin feature/go-setup

# Merge back to refactor branch
git checkout backend/go-refactor
git merge feature/go-setup

# When ready to deploy
git checkout main
git merge backend/go-refactor
```

---

## 🐳 Docker Configuration

### docker-compose.yml (Updated)

```yaml
version: '3.8'

services:
  # PostgreSQL Database (shared by both backends)
  db:
    image: postgres:16-alpine
    container_name: ecommerce-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ecommerce
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Original Node.js Backend (port 3000)
  backend-node:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ecommerce-backend-node
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ecommerce
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  # New Go Backend (port 3001)
  backend-go:
    build:
      context: ./backend-go
      dockerfile: Dockerfile
    container_name: ecommerce-backend-go
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ecommerce
      JWT_SECRET: ${JWT_SECRET}
      GO_ENV: development
      PORT: 3001
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend-go:/app

volumes:
  postgres_data:
```

### Backend-Go Dockerfile

```dockerfile
# Multi-stage build for optimal size
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .
COPY --from=builder /app/.env.example .env

EXPOSE 3001

CMD ["./main"]
```

---

## 🚀 AWS Deployment Strategy

### Phase 1: Local Development & Testing
- Run both backends locally (ports 3000, 3001)
- Frontend points to Node.js backend (existing)
- Test Go backend separately

### Phase 2: Staging Environment
- Deploy Go backend to EC2 on different port
- Run in parallel with Node.js backend
- Internal testing with test domain

### Phase 3: Canary Deployment
- Use Nginx load balancer
- Route 10% traffic → Go backend
- Route 90% traffic → Node.js backend
- Monitor performance & errors

### Phase 4: Full Deployment
- Switch 100% traffic to Go backend
- Keep Node.js backend as backup
- Monitor for 1 week

### Phase 5: Cleanup
- Remove Node.js backend from EC2
- Update documentation
- Archive old code

---

## 📊 Performance Metrics to Track

### Before (Node.js)
- [ ] Average response time
- [ ] Memory usage
- [ ] CPU usage
- [ ] Concurrent connections
- [ ] Cold start time

### After (Go)
- [ ] Average response time (target: 30-50% faster)
- [ ] Memory usage (target: 60-70% less)
- [ ] CPU usage
- [ ] Concurrent connections (target: 3-5x more)
- [ ] Binary size

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API incompatibility | High | Keep same REST endpoints & response format |
| Database migration issues | High | Use same PostgreSQL database, no schema changes |
| Production downtime | Critical | Blue-green deployment, keep Node.js as backup |
| Missing features | Medium | Feature parity checklist, comprehensive testing |
| Performance regression | Medium | Load testing before full deployment |
| Team unfamiliarity | Low | Documentation, code comments |

---

## ✅ Success Criteria

- [ ] All REST endpoints return same response format
- [ ] GraphQL API fully compatible
- [ ] All tests passing
- [ ] Performance improvement >30%
- [ ] Memory usage reduction >50%
- [ ] Zero production downtime during switch
- [ ] All AI features working
- [ ] Stripe payments functional
- [ ] JWT authentication working

---

## 📚 Resources & References

### Go Documentation
- [Gin Web Framework](https://gin-gonic.com/)
- [GORM ORM](https://gorm.io/)
- [gqlgen GraphQL](https://gqlgen.com/)
- [Stripe Go SDK](https://github.com/stripe/stripe-go)

### Migration Guides
- [Prisma to GORM](https://gorm.io/docs/)
- [Express to Gin](https://gin-gonic.com/docs/)
- [Node.js to Go Best Practices](https://golang.org/doc/)

---

## 📅 Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1-2** | Week 1 | Auth + Core setup |
| **Phase 3-5** | Week 2 | Products, Cart, Orders |
| **Phase 6-7** | Week 2-3 | Payment + AI |
| **Phase 8** | Week 3 | GraphQL |
| **Phase 9** | Week 3 | Testing |
| **Phase 10** | Week 3 | Docker + Deploy |
| **Total** | 3 weeks | Production-ready Go backend |

---

## 🎯 Next Steps

1. **Review this plan** - Confirm the approach
2. **Create Git branch** - `git checkout -b backend/go-refactor`
3. **Initialize Go project** - Setup go.mod and directory structure
4. **Start Phase 1** - Core infrastructure
5. **Commit frequently** - Small, incremental changes

---

**Last Updated:** 2025-10-12
**Status:** Planning Phase
**Branch:** Not yet created
**Current Backend:** Node.js (stable in production)
