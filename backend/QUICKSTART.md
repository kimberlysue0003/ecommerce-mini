# ⚡ Quick Start Guide

Get the backend running in **5 minutes**!

---

## 🐳 Option 1: Docker (Easiest)

### Step 1: Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Step 2: Setup
```bash
cd backend

# Copy environment file
cp .env.example .env

# Start everything (PostgreSQL + Backend)
docker-compose up -d

# Wait 30 seconds for database to be ready, then seed data
docker-compose exec backend npm run db:seed
```

### Step 3: Test
Open your browser:
- **GraphQL Playground:** http://localhost:3000/graphql
- **Health Check:** http://localhost:3000/health

Try this query in GraphQL Playground:
```graphql
query {
  products(limit: 5) {
    products {
      title
      price
    }
  }
}
```

### Step 4: Login
```graphql
mutation {
  login(email: "demo@example.com", password: "demo123") {
    token
    user {
      email
      name
    }
  }
}
```

Copy the `token` from the response, then add to **Headers** in GraphQL Playground:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

---

## 💻 Option 2: Local Development

### Step 1: Prerequisites
- **Node.js 20+**: Download from [nodejs.org](https://nodejs.org/)
- **PostgreSQL 16**: Download from [postgresql.org](https://www.postgresql.org/download/)

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Setup Database
```bash
# Start PostgreSQL service (Windows/Mac/Linux)
# Then create database
createdb ecommerce

# Or use psql:
psql -U postgres
CREATE DATABASE ecommerce;
\q
```

### Step 4: Configure Environment
```bash
# Copy .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ecommerce?schema=public"
```

### Step 5: Setup Database Schema
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### Step 6: Start Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 3000
📍 REST API: http://localhost:3000/api
🔮 GraphQL: http://localhost:3000/graphql
```

---

## 🧪 Test the API

### REST API Examples

**Get Products:**
```bash
curl http://localhost:3000/api/products
```

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**AI Search:**
```bash
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "wireless headphones under 100"}'
```

### GraphQL Examples

Open http://localhost:3000/graphql and try:

**Get Products with Filters:**
```graphql
query {
  products(
    filter: { search: "keyboard", minPrice: 200, maxPrice: 500 }
    limit: 5
  ) {
    products {
      id
      title
      price
      rating
    }
  }
}
```

**AI Search:**
```graphql
query {
  aiSearch(query: "gaming mouse under 50") {
    query
    results {
      title
      price
    }
  }
}
```

**Get Similar Products:**
```graphql
query {
  similarProducts(productId: "YOUR_PRODUCT_ID", limit: 3) {
    title
    price
    tags
  }
}
```

---

## 📱 Connect Frontend

Update your frontend `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

Then modify frontend to use backend API instead of mock data.

---

## 🛑 Common Issues

### Issue: Port 3000 already in use
**Solution:**
```bash
# Change PORT in .env
PORT=3001

# Or kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: Database connection failed
**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d ecommerce
   ```

### Issue: Prisma Client errors
**Solution:**
```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
npm run db:seed
```

### Issue: Docker container won't start
**Solution:**
```bash
# Check logs
docker-compose logs backend

# Restart
docker-compose down
docker-compose up -d --build
```

---

## 🎯 Next Steps

1. ✅ **Test all endpoints** in GraphQL Playground
2. ✅ **Try REST APIs** with curl or Postman
3. ✅ **Connect your frontend** to the backend
4. ✅ **Read [README.md](./README.md)** for full documentation
5. ✅ **Explore [bonus.md](./bonus.md)** for future features

---

## 🚀 Ready to Deploy?

See deployment guides in [README.md](./README.md#-deployment)

---

**Need Help?** Check [README.md](./README.md) or create a GitHub issue.

Happy coding! 🎉
