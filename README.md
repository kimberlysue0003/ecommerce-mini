# 🛍️ E-commerce Full-Stack Production Demo

![Status](https://img.shields.io/badge/status-production-success)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.quickshop.fit&up_message=online&down_message=offline)
![License](https://img.shields.io/badge/license-MIT-blue)
![Last Commit](https://img.shields.io/github/last-commit/kimberlysue0003/ecommerce-mini)

![Frontend CI](https://github.com/kimberlysue0003/ecommerce-mini/actions/workflows/frontend-ci.yml/badge.svg)
![Backend CI](https://github.com/kimberlysue0003/ecommerce-mini/actions/workflows/backend-ci.yml/badge.svg)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)

![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazon-aws&logoColor=white)
![AWS RDS](https://img.shields.io/badge/AWS-RDS-527FFF?logo=amazon-rds&logoColor=white)
![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-FF9900?logo=aws-amplify&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-008CDD?logo=stripe&logoColor=white)

A **production-deployed** Full-Stack E-commerce Application built by **Kimberly Su**, showcasing enterprise-grade web development with **React 19 + TypeScript**, **Node.js + PostgreSQL**, **Stripe Payment Integration**, **AI-powered search**, and complete **AWS cloud deployment**.

**🌐 Live Demo:** [https://www.quickshop.fit](https://www.quickshop.fit)

**🎯 Built to demonstrate:** Senior Full-Stack Engineering capabilities with TypeScript, REST/GraphQL APIs, Database Design, Payment Processing, AI Integration, AWS Cloud Architecture, and Production DevOps.

---

## 🚀 Tech Stack

### Frontend
- React 19 + TypeScript 5.7 + Vite
- TailwindCSS 4 + Framer Motion
- React Router v7
- TanStack Query

### Backend
- Node.js 20 + TypeScript 5.7
- Express.js (REST API)
- GraphQL (graphql-yoga)
- PostgreSQL 16 + Prisma ORM
- JWT Authentication

### AI Features (Free - No External APIs)
- Rule-based NLP query parsing
- TF-IDF content-based similarity
- Collaborative Filtering recommendations
- User Behavior Tracking

### Payment Integration
- Stripe Payment Gateway (Test & Production)

### Cloud & DevOps
- AWS EC2 + RDS + Amplify
- Nginx + PM2 + Let's Encrypt SSL
- Docker + Docker Compose
- GitHub Actions CI/CD

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
- Product browsing with advanced filters and search
- Real-time shopping cart with quantity management
- User authentication & authorization (JWT)
- **Stripe Payment Integration** with test mode
- Order creation, tracking, and history
- User behavior analytics for personalization

### 🔐 Security & Best Practices
- Password hashing (bcrypt)
- JWT token authentication
- Rate limiting (100 req/15min)
- CORS protection
- Input validation (Zod)
- SQL injection prevention (Prisma)

---

## 🏗️ Production Architecture (AWS)

```
┌──────────────────────────────────────────────────────────────────┐
│                   AWS Amplify (Frontend CDN)                     │
│              https://www.quickshop.fit                           │
│                   React 19 + TypeScript                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Home Page │ Product Detail │ Cart │ AI Search │ Checkout │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS/REST API
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│              AWS EC2 (Ubuntu + Nginx + PM2)                      │
│              https://api.quickshop.fit                           │
│                   Let's Encrypt SSL                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  REST API  │  GraphQL   │  AI Engine  │  Stripe Payment  │  │
│  │  /api/*    │  /graphql  │  NLP/TF-IDF │  Integration     │  │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │ Prisma ORM (SSL)
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│              AWS RDS PostgreSQL (Managed Database)               │
│              ap-southeast-1 (Singapore)                          │
│              Free Tier: db.t4g.micro                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Users │ Products │ Orders │ Cart │ Payments │ Behaviors │  │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

External Services:
  └─> Stripe Payment API (Test Mode)
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
- 🌐 Frontend (Local): http://localhost:5173
- 🌐 Frontend (Production): https://www.quickshop.fit
- 🔌 REST API (Local): http://localhost:3000/api
- 🔌 REST API (Production): https://api.quickshop.fit/api
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

**Payment** (Requires Authentication)
```http
POST   /api/payment/create-payment-intent    # Create Stripe payment
POST   /api/payment/confirm                  # Confirm payment & create order
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

## 🚢 Production Deployment (AWS)

This application is **currently deployed on AWS** with the following architecture:

### Infrastructure Setup

**1. AWS RDS PostgreSQL Database**
- Instance: `db.t4g.micro` (Free Tier)
- Region: `ap-southeast-1` (Singapore)
- Automatic backups enabled
- SSL/TLS encryption in transit

**2. AWS EC2 Backend Server**
- Instance: `t3.micro` (Free Tier eligible)
- OS: Ubuntu 24.04 LTS
- Process Manager: PM2 (auto-restart on crash)
- Reverse Proxy: Nginx with SSL termination
- SSL Certificate: Let's Encrypt (auto-renewal)

**3. AWS Amplify Frontend Hosting**
- Global CDN distribution
- Automatic CI/CD from GitHub
- Free SSL certificate
- Custom domain: `www.quickshop.fit`

**4. Custom Domain Configuration**
- Domain: `quickshop.fit` (Namecheap)
- Frontend: `www.quickshop.fit` → AWS Amplify
- Backend API: `api.quickshop.fit` → AWS EC2
- SSL/TLS: Let's Encrypt certificates

### Deployment Steps (Automated)

**Backend (EC2):**
```bash
# PM2 automatically restarts on code changes
git pull origin main
npm install
npm run build
pm2 restart all
```

**Frontend (Amplify):**
- Automatic deployment on `git push` to main branch
- Build command: `npm run build`
- Deploy time: ~2-3 minutes

### Environment Variables (Production)

**Backend (.env on EC2):**
```bash
DATABASE_URL=postgresql://[RDS_ENDPOINT]/ecommerce
JWT_SECRET=[32-char-secret]
STRIPE_SECRET_KEY=[stripe-key]
NODE_ENV=production
```

**Frontend (.env.production):**
```bash
VITE_API_URL=https://api.quickshop.fit/api
VITE_GRAPHQL_URL=https://api.quickshop.fit/graphql
```

---

## 🎯 Technical Highlights

This project demonstrates:

✅ **Full-Stack TypeScript** - End-to-end type safety across frontend & backend
✅ **RESTful + GraphQL** - Dual API architecture for flexibility
✅ **Database Design** - Normalized PostgreSQL schema with Prisma ORM
✅ **Authentication & Authorization** - Secure JWT implementation
✅ **Payment Processing** - Stripe integration with secure checkout flow
✅ **AI/ML Algorithms** - Custom TF-IDF & collaborative filtering (no external APIs)
✅ **AWS Cloud Deployment** - Production infrastructure on EC2, RDS, Amplify
✅ **DevOps & Infrastructure** - Nginx, PM2, Let's Encrypt SSL automation
✅ **CI/CD Pipeline** - GitHub → Amplify auto-deployment
✅ **Security Best Practices** - HTTPS, bcrypt, helmet, rate limiting, CORS
✅ **Clean Architecture** - Layered design with separation of concerns
✅ **Performance Optimization** - Database indexing, query optimization

---

## 📚 Documentation

- **Backend API Docs:** [backend/README.md](./backend/README.md)
- **Quick Start Guide:** [backend/QUICKSTART.md](./backend/QUICKSTART.md)
- **Architecture Plan:** [backend/plan.md](./backend/plan.md)
- **Future Features:** [backend/bonus.md](./backend/bonus.md)

---

## 🔮 Future Enhancements

- Admin dashboard with analytics
- Email notifications (order confirmations)
- Product image uploads (S3 integration)
- Redis caching layer
- Advanced product reviews and ratings

---

## 👩‍💻 Author

**Kimberly Su**
Senior Full-Stack Engineer
14+ years experience in Game Dev, 3D/VR/AR & Web Engineering

🌐 **Live Demo:** [https://www.quickshop.fit](https://www.quickshop.fit)
💼 **GitHub:** [github.com/kimberlysue0003](https://github.com/kimberlysue0003)

---

## 📄 License

MIT License - Feel free to use this project for learning or portfolio purposes!

---

## 🙏 Acknowledgments

Built to showcase:
- **Production-Ready Full-Stack Development** - Real deployed application on AWS
- **TypeScript Mastery** - End-to-end type safety and modern patterns
- **Cloud Architecture** - AWS EC2, RDS, Amplify infrastructure design
- **Payment Integration** - Stripe payment processing implementation
- **RESTful + GraphQL APIs** - Dual API architecture design
- **AI/ML Implementation** - Custom algorithms without expensive external APIs
- **DevOps Excellence** - Nginx, PM2, SSL automation, CI/CD pipelines
- **Security Best Practices** - HTTPS, authentication, rate limiting, validation
- **Database Engineering** - PostgreSQL schema design with Prisma ORM
- **Clean Architecture** - Scalable, maintainable codebase structure

---

**⭐ Star this repo if you find it helpful!**

**🚀 Happy Coding!**
