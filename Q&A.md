# 🎯 E-commerce Full-Stack Project - Interview Q&A

> 压力面试完整问答集 - 70+ 技术深挖问题及标准答案

---

## 📊 项目整体分析

### 项目定位
- 全栈电商 Demo,重点展示**生产级工程能力**
- 已部署到 AWS 云端 (quickshop.fit)
- 覆盖前后端全链路、支付集成、AI功能、DevOps

### 核心技术栈

**前端:**
- React 19 + TypeScript 5.7 + Vite
- TailwindCSS 4 + Framer Motion (动画)
- React Router v7 (路由)
- TanStack Query (数据获取/缓存)
- Stripe React SDK (支付UI)

**后端:**
- Node.js 20 + TypeScript 5.7
- Express.js (REST API)
- GraphQL (graphql-yoga)
- PostgreSQL 16 + Prisma ORM
- JWT 认证 + bcrypt 密码加密
- Stripe 支付集成
- Helmet + CORS + Rate Limiting (安全)

**AI 功能:**
- 规则式 NLP 查询解析
- TF-IDF 内容相似度
- 协同过滤推荐
- 用户行为追踪

**基础设施 (AWS):**
- EC2 (后端 + Nginx + PM2)
- RDS PostgreSQL (数据库)
- Amplify (前端CDN + CI/CD)
- Let's Encrypt SSL
- 自定义域名

---

## 🔥 A. 架构与设计决策 (15题)

### 1. 为什么同时用 REST 和 GraphQL?

**回答:**
- REST 用于简单的 CRUD 操作,比如用户认证、创建订单,接口简单直观
- GraphQL 用于复杂查询场景,比如产品列表需要灵活选择字段,避免 over-fetching
- 这是为了展示多范式 API 设计能力

**追问: 实际生产中你会选哪个?**

看团队和场景:
- 如果是移动端为主、需要精确控制流量 → GraphQL
- 如果是传统 Web、团队不熟悉 GraphQL → REST
- 我个人倾向 REST + 精心设计的端点,因为调试方便、缓存友好(HTTP 缓存)
- GraphQL 的优势在于客户端灵活性,但也带来复杂度(N+1、缓存难)

---

### 2. 为什么用 Context API 而不是 Redux/Zustand?

**回答:**
- 项目状态管理需求简单:只有 Cart 和 Auth 两个全局状态
- Context + useReducer 足够,避免引入额外依赖
- 性能足够(状态更新频率不高)

**追问: 什么规模算大?什么时候必须用状态管理库?**

判断标准:
1. **状态嵌套层级 > 3 层** (Context 会导致重复渲染)
2. **需要跨组件通信的状态 > 5 个**
3. **需要 DevTools 调试** (Redux DevTools 很强大)
4. **需要中间件** (异步、日志、持久化)

我会选 **Zustand** 而不是 Redux:
- API 简单(学习成本低)
- 没有 Provider 嵌套地狱
- 性能好(基于订阅,精确更新)
- TypeScript 友好

---

### 3. 购物车为什么用 localStorage 而不是数据库?

**回答:**
- 支持**未登录用户**的购物车(游客模式)
- 减少服务器压力(不用每次加购都请求后端)
- 即时响应(本地操作,无网络延迟)

**追问: 登录后怎么同步?你实现了吗?**

没实现,但如果要做:

```typescript
// 登录后的同步逻辑
async function syncCartToBackend(localCart: CartItem[]) {
  // 1. 获取服务器购物车
  const serverCart = await fetchAPI('/cart');

  // 2. 合并策略:相同商品累加数量,不同商品都保留
  const merged = mergeCartItems(localCart, serverCart);

  // 3. 批量更新到服务器
  await fetchAPI('/cart/batch', {
    method: 'POST',
    body: JSON.stringify(merged)
  });

  // 4. 清空 localStorage
  localStorage.removeItem('cart');
}
```

**追问: 如果用户在多个设备登录,购物车怎么同步?**
- 服务器购物车为准(单一数据源)
- 登录时拉取服务器购物车覆盖本地
- 或者弹窗让用户选择:"保留本地"还是"使用云端"

---

### 4. AI 搜索为什么不用真正的 AI(GPT)?

**回答:**
- **成本考虑**: GPT API 每次调用都要钱,Demo 项目不合适
- **展示算法能力**: TF-IDF 和协同过滤是经典算法,展示我理解原理
- **响应速度**: 本地算法毫秒级,GPT 可能要几秒

**追问: 如果要用 GPT,具体怎么做?**

**方案1: GPT 解析查询意图**
```typescript
async function aiSearch(query: string) {
  const prompt = `
    Parse this product search query into JSON:
    "${query}"

    Return: {
      "keywords": string[],
      "priceMin": number | null,
      "priceMax": number | null,
      "category": string | null,
      "sortBy": "price" | "rating" | "relevance"
    }
  `;

  const result = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const filters = JSON.parse(result.choices[0].message.content);
  return searchProducts(filters);
}
```

**方案2: 向量搜索(更好的方案)**
```typescript
async function vectorSearch(query: string) {
  // 1. 把查询转成 embedding
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });

  // 2. 在向量数据库中搜索(Pinecone/Weaviate/pgvector)
  const results = await vectorDB.search({
    vector: queryEmbedding.data[0].embedding,
    topK: 20
  });

  return results;
}
```

**技术栈:**
- **向量数据库**: Pinecone(托管) / Weaviate / PostgreSQL + pgvector(省钱)
- **Embedding 模型**: OpenAI text-embedding-3-small(便宜) / Cohere / 开源模型
- **优势**: 语义搜索("便宜的耳机" 能匹配 "性价比高的 headphone")

---

### 5. 为什么选 PostgreSQL?

**回答:**
- **复杂查询**: 订单、用户、商品多表 JOIN
- **JSON 支持**: 商品的 tags 数组可以直接存 JSON
- **事务完整性**: ACID 保证支付场景的一致性
- **全文搜索**: 内置 tsvector/tsquery

**追问: 什么场景用 MongoDB?**
- **文档型数据**: 产品属性差异大(不同类别字段不同)
- **快速迭代**: Schema 灵活,不需要迁移
- **读多写多**: 横向扩展容易
- **但不适合**: 复杂事务、多表关联查询

---

### 6. Prisma vs 原生 SQL?

**回答:**
- **类型安全**: Prisma 自动生成 TypeScript 类型
- **SQL 注入防护**: 参数化查询
- **迁移管理**: `prisma migrate` 自动生成迁移文件
- **开发效率**: 不用写 SQL,自动补全

**追问: 性能损耗怎么办?**

Prisma 底层还是生成 SQL,性能损耗很小(<5%)。对于复杂查询,可以用 `prisma.$queryRaw`:

```typescript
// 复杂聚合查询,Prisma 写不了
const result = await prisma.$queryRaw`
  SELECT
    category,
    AVG(price) as avg_price,
    COUNT(*) as count
  FROM products
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY category
  HAVING COUNT(*) > 10
`;
```

**追问: 复杂查询 Prisma 写不了怎么办?**
- 用 `$queryRaw` 或 `$executeRaw`
- 或者结合使用:Prisma 处理 CRUD,复杂查询用原生 SQL

---

### 7. JWT 存储在哪?

**回答:**
- 存在 **localStorage**
- 优点:持久化,刷新页面不丢失
- 缺点:**XSS 风险**(如果网站被注入脚本,token 会被盗)

**追问: 怎么防 XSS?**

**1. Content Security Policy (CSP):**
```typescript
// 后端设置 CSP Header
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // 只允许自己的脚本
    }
  }
}));
```

**2. HttpOnly Cookie (更好的方案):**
```typescript
// 后端登录时设置 Cookie
res.cookie('token', jwt, {
  httpOnly: true,  // JS 无法访问
  secure: true,    // 只在 HTTPS 下发送
  sameSite: 'strict', // 防 CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
});

// 前端不需要手动带 token,浏览器自动发送
fetch('/api/cart', { credentials: 'include' });
```

**3. Refresh Token 机制:**
```typescript
// Access Token (短期,15分钟) + Refresh Token (长期,7天)
{
  accessToken: "xxx",  // localStorage
  refreshToken: "yyy"  // HttpOnly Cookie
}

// Access Token 过期时,用 Refresh Token 换新的
async function refreshAccessToken() {
  const res = await fetch('/api/auth/refresh', {
    credentials: 'include' // 自动带上 Refresh Token Cookie
  });
  const { accessToken } = await res.json();
  localStorage.setItem('token', accessToken);
}
```

---

### 8. 为什么用 React Router 而不是 TanStack Router?

**回答:**
- React Router v7 已经很强大(支持 data loading、defer)
- 生态成熟,文档齐全
- 团队熟悉度高

**追问: Next.js 不是更好吗?**

**Next.js 优势**: SSR、SEO、文件路由、API Routes

**为什么不用**:
1. 这个项目前后端分离,后端已经是独立的 Node.js 服务
2. 不需要 SEO(电商网站需要,但这是 Demo)
3. Vite 开发体验更好(HMR 更快)

**如果要 SEO**: 会用 Next.js 或 Remix(更现代的路由设计)

---

### 9. 为什么用 Vite?

**回答:**
- **启动速度**: Webpack 冷启动可能要 10s,Vite < 1s
- **HMR**: 热更新超快,改代码立即看到效果
- **原生 ESM**: 开发时不打包,浏览器直接加载 ES modules
- **React 19 官方推荐**

**对比:**

| 特性 | Vite | Webpack |
|------|------|---------|
| 冷启动 | <1s | 10s+ |
| HMR | 毫秒级 | 秒级 |
| 配置 | 简单 | 复杂 |
| 生态 | 新,快速增长 | 成熟 |

---

### 10. 购物车 reducer 为什么要处理非法数据?

**回答:**
```typescript
// 防止 localStorage 被恶意修改
const qty = Number(it.quantity ?? 1);
const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
```

**追问: 如果用户恶意修改价格怎么办?**

**前端价格不可信,必须后端验证:**
```typescript
// 后端创建订单时重新计算价格
async function createOrder(items: CartItem[]) {
  let total = 0;

  for (const item of items) {
    // 从数据库查真实价格
    const product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    if (!product) throw new Error('Product not found');

    // 用真实价格计算,忽略前端传的价格
    total += product.price * item.quantity;
  }

  return prisma.order.create({
    data: { total, items: { create: items } }
  });
}
```

---

### 11. 为什么不用 WebSocket 实时更新库存?

**回答:**
- 项目规模不需要
- 增加复杂度

**追问: 如果要加怎么做?**

**Socket.io + Redis Pub/Sub:**
```typescript
// 后端
import { Server } from 'socket.io';
import { createClient } from 'redis';

const io = new Server(server);
const redis = createClient();
const subscriber = redis.duplicate();

// 订阅库存变化
subscriber.subscribe('stock-update', (message) => {
  const { productId, stock } = JSON.parse(message);
  // 广播给所有客户端
  io.emit('stock-update', { productId, stock });
});

// 库存变化时发布消息
async function updateStock(productId: string, quantity: number) {
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } }
  });

  // 发布到 Redis
  await redis.publish('stock-update', JSON.stringify({ productId, stock }));
}

// 前端
import io from 'socket.io-client';

const socket = io('https://api.quickshop.fit');

socket.on('stock-update', ({ productId, stock }) => {
  // 更新 UI
  queryClient.setQueryData(['product', productId], (old) => ({
    ...old,
    stock
  }));
});
```

---

### 12. 为什么没有分页?

**回答:**
- Demo 数据少
- 实际有分页参数(page/limit)

**追问: 无限滚动 vs 分页,选哪个?**

| 特性 | 无限滚动 | 分页 |
|------|---------|------|
| **用户体验** | ✅ 流畅 | 🟡 需要点击 |
| **SEO** | ❌ 难索引 | ✅ 每页独立URL |
| **性能** | 🟡 累积DOM | ✅ 固定数量 |
| **适用场景** | 社交媒体、新闻 | 搜索结果、商品列表 |

**选择:**
- **无限滚动**: 内容消费型(Instagram、Twitter)
- **分页**: 目标导向型(Google、电商)

**追问: 虚拟滚动?**

大列表(>1000项)必须用虚拟滚动:
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={10000}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ProductCard product={products[index]} />
    </div>
  )}
</FixedSizeList>
```

---

### 13. 为什么 AI 推荐没有用协同过滤的 ALS/矩阵分解?

**回答:**
- 数据量小,简单相似度足够
- 展示基础算法理解

**追问: 具体怎么实现协同过滤?**

**简单版本 - 基于用户的协同过滤:**
```typescript
// 1. 构建用户-商品评分矩阵
const userItemMatrix = {
  'user1': { 'product1': 5, 'product2': 3 },
  'user2': { 'product1': 4, 'product2': 5, 'product3': 2 }
};

// 2. 计算用户相似度(余弦相似度)
function cosineSimilarity(user1: Record<string, number>, user2: Record<string, number>) {
  const commonItems = Object.keys(user1).filter(id => user2[id]);

  if (commonItems.length === 0) return 0;

  const dotProduct = commonItems.reduce((sum, id) => sum + user1[id] * user2[id], 0);
  const norm1 = Math.sqrt(Object.values(user1).reduce((sum, r) => sum + r * r, 0));
  const norm2 = Math.sqrt(Object.values(user2).reduce((sum, r) => sum + r * r, 0));

  return dotProduct / (norm1 * norm2);
}

// 3. 推荐:找相似用户喜欢但当前用户没买的商品
function recommendForUser(userId: string, topK = 10) {
  const currentUser = userItemMatrix[userId];

  // 找最相似的用户
  const similarities = Object.keys(userItemMatrix)
    .filter(id => id !== userId)
    .map(otherUserId => ({
      userId: otherUserId,
      similarity: cosineSimilarity(currentUser, userItemMatrix[otherUserId])
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // 前5个最相似用户

  // 收集他们喜欢的商品
  const recommendations = new Map<string, number>();

  for (const { userId: similarUserId, similarity } of similarities) {
    const theirRatings = userItemMatrix[similarUserId];

    for (const [productId, rating] of Object.entries(theirRatings)) {
      if (!currentUser[productId]) { // 当前用户没买过
        const score = (recommendations.get(productId) || 0) + rating * similarity;
        recommendations.set(productId, score);
      }
    }
  }

  return Array.from(recommendations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([productId]) => productId);
}
```

**矩阵分解(更高级):**
使用库如 `ml-matrix`:
```typescript
import { SVD } from 'ml-matrix';

// 用 SVD 分解用户-商品矩阵
const matrix = [[5, 3, 0], [4, 0, 5], [0, 4, 4]];
const svd = new SVD(matrix);

// 预测用户对商品的评分
const predicted = svd.predict(userId, productId);
```

---

### 14. 为什么没有服务端渲染(SSR)?

**回答:**
- SPA 足够,SEO 不是重点
- Amplify 托管简单

**追问: 如果要 SEO 怎么办?**

**方案1: Next.js App Router**
```tsx
// app/products/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug); // 服务端获取
  return <ProductDetail product={product} />;
}
```

**方案2: Remix**
```tsx
// routes/products.$slug.tsx
export async function loader({ params }) {
  return json(await getProduct(params.slug));
}

export default function ProductPage() {
  const product = useLoaderData<typeof loader>();
  return <ProductDetail product={product} />;
}
```

**方案3: 预渲染(SSG)**
```bash
# Next.js
npm run build # 生成静态HTML

# 或者 React + prerender.io (动态预渲染)
```

---

### 15. 为什么没有 Redis 缓存?

**回答:**
- 数据库性能足够
- 增加运维复杂度

**追问: 什么场景一定要 Redis?**

**1. 热点商品缓存:**
```typescript
async function getProduct(id: string) {
  // 先查 Redis
  const cached = await redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached);

  // 查数据库
  const product = await prisma.product.findUnique({ where: { id } });

  // 缓存 1 小时
  await redis.setex(`product:${id}`, 3600, JSON.stringify(product));

  return product;
}
```

**2. Session 存储:**
```typescript
// 替代 JWT,session 存 Redis
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: 'secret',
  resave: false
}));
```

**3. 排行榜:**
```typescript
// Sorted Set
await redis.zadd('leaderboard', score, userId);
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
```

**4. 限流:**
```typescript
// 滑动窗口限流
const key = `rate:${userId}:${Date.now() / 60000 | 0}`;
const count = await redis.incr(key);
await redis.expire(key, 60);

if (count > 100) throw new Error('Rate limit exceeded');
```

---

## 🎨 B. 前端深挖 (15题)

### 16. React 19 有什么新特性?

**回答:**

**1. Actions - 简化表单处理:**
```tsx
function AddToCart({ product }) {
  async function addAction(formData) {
    await addToCart(product.id, formData.get('quantity'));
  }

  return (
    <form action={addAction}>
      <input name="quantity" type="number" />
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

**2. use() hook - 条件式数据获取:**
```tsx
function Product({ productPromise }) {
  const product = use(productPromise); // 可以在条件语句中使用
  return <div>{product.name}</div>;
}
```

**3. Server Components (需要框架支持,如 Next.js)**

**追问: 你用了吗?**
- 没有完全用,因为这个项目是 SPA + 后端分离
- 如果用 Next.js,会大量使用 Server Components

---

### 17. TanStack Query 缓存策略?

**回答:**
```typescript
useQuery({
  queryKey: ['products'],
  queryFn: getProducts,
  staleTime: 5 * 60 * 1000,  // 5分钟内认为数据是新鲜的
  cacheTime: 10 * 60 * 1000, // 10分钟后清除缓存
  refetchOnWindowFocus: true // 窗口聚焦时重新获取
});
```

**追问: 购物车和产品列表的缓存一致性?**

```typescript
// 加购后,使缓存失效
const mutation = useMutation({
  mutationFn: addToCart,
  onSuccess: () => {
    // 方案1: 失效缓存,重新获取
    queryClient.invalidateQueries({ queryKey: ['cart'] });

    // 方案2: 乐观更新(更快)
    queryClient.setQueryData(['cart'], (old) => {
      return [...old, newItem];
    });
  }
});
```

---

### 18. Framer Motion 性能问题?

**回答:**

**优化原则:**
1. 只动画 `transform` 和 `opacity` (GPU 加速)
2. 避免 `width/height/top/left` (触发 layout)

```tsx
// ❌ 性能差
<motion.div animate={{ width: 100 }} />

// ✅ 性能好
<motion.div animate={{ scale: 1.2 }} />
```

**追问: 大列表动画会卡吗?怎么优化?**

**1. 虚拟滚动**: react-window / react-virtualized

**2. 懒加载**: IntersectionObserver

**3. 降低动画复杂度**: 只对可视区域动画
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }} // 只在可视区域时动画
  viewport={{ once: true }} // 只执行一次
/>
```

---

### 19. TailwindCSS 4 vs 3?

**回答:**
- **Oxide 引擎**: 用 Rust 重写,编译速度提升 10x
- **零配置**: 自动检测内容路径
- **CSS 变量优先**: 更好的动态主题支持

**追问: 为什么不用 CSS-in-JS?**

| 特性 | TailwindCSS | CSS-in-JS (styled-components) |
|------|-------------|-------------------------------|
| 性能 | ✅ 零运行时 | ❌ 运行时解析 |
| 打包体积 | ✅ 小(只包含用到的) | ❌ 大 |
| 开发体验 | ✅ 快(直接在 JSX 写) | ❌ 需要定义组件 |
| 动态样式 | ❌ 难(需要变体) | ✅ 容易 |

**结论**: 静态样式用 Tailwind,动态样式用 CSS 变量 + Tailwind

---

### 20. useReducer vs useState?

**回答:**

**用 useReducer 的场景:**
1. 状态逻辑复杂(多个子状态相互依赖)
2. 下一个状态依赖上一个状态
3. 需要测试状态逻辑(reducer 是纯函数)

```typescript
// ❌ 复杂的 useState
const [quantity, setQuantity] = useState(1);
const [price, setPrice] = useState(0);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(quantity * price); // 多次渲染
}, [quantity, price]);

// ✅ useReducer 更清晰
const [state, dispatch] = useReducer(cartReducer, initialState);
dispatch({ type: 'add', product });
```

---

### 21. 为什么不用 useMemo/useCallback 优化?

**回答:**
- 过早优化是万恶之源
- 项目规模小,性能足够

**追问: 什么情况下必须用?**

**1. 大列表:**
```tsx
const ProductList = ({ products }) => {
  // ❌ 每次渲染都创建新函数
  return products.map(p => <ProductCard onClick={() => addToCart(p)} />);

  // ✅ 使用 useCallback
  const handleAdd = useCallback((product) => addToCart(product), []);
  return products.map(p => <ProductCard onClick={handleAdd} product={p} />);
};
```

**2. 昂贵计算:**
```tsx
const ExpensiveComponent = ({ items }) => {
  // ❌ 每次渲染都计算
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // ✅ 缓存计算结果
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );
};
```

---

### 22. 10000 个商品怎么优化?

**回答:**

**1. 虚拟滚动:**
```tsx
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  rowCount={Math.ceil(products.length / 3)}
  width={1200}
  height={800}
  columnWidth={400}
  rowHeight={400}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <ProductCard product={products[rowIndex * 3 + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

**2. 无限滚动:**
```tsx
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['products'],
  queryFn: ({ pageParam = 1 }) => getProducts({ page: pageParam }),
  getNextPageParam: (lastPage, pages) => lastPage.nextPage,
});

// IntersectionObserver 触发加载
```

**3. 图片懒加载:**
```tsx
<img
  src={product.image}
  loading="lazy" // 原生懒加载
/>
```

---

### 23. Stripe 支付流程?

**回答:**

**前端:**
```tsx
// 1. 创建 PaymentIntent
const { clientSecret } = await createPaymentIntent(amount);

// 2. 渲染支付表单
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <CheckoutForm />
</Elements>

// 3. 确认支付
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: 'https://example.com/success',
  },
});
```

**后端:**
```typescript
// 1. 创建 PaymentIntent
app.post('/payment/create', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount, // 必须验证!
    currency: 'usd',
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});

// 2. Webhook 处理支付成功
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, secret);

  if (event.type === 'payment_intent.succeeded') {
    const { metadata } = event.data.object;
    await createOrder(metadata.userId, metadata.items);
  }

  res.json({ received: true });
});
```

**追问: 支付成功但订单创建失败怎么办?**

**1. 幂等性**: 用 `paymentIntentId` 作为订单的唯一标识
```typescript
await prisma.order.upsert({
  where: { paymentIntentId },
  update: {},
  create: { paymentIntentId, userId, items }
});
```

**2. 事务:**
```typescript
await prisma.$transaction(async (tx) => {
  // 创建订单
  const order = await tx.order.create({ data: orderData });

  // 扣减库存
  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } }
  });
});
```

**3. 重试机制**: Stripe Webhook 会自动重试(最多 3 天)

---

### 24. AI 搜索解析为什么不放后端?

**回答:**
- **Demo 的简化设计**,实际应该在后端
- 前端可以做**实时预览**,用户输入时显示解析结果

**追问: 前端解析有什么问题?**

1. **安全性**: 前端可以被绕过
2. **一致性**: 前后端解析逻辑可能不同
3. **性能**: 复杂解析应该在服务器

**正确做法:**
- 前端只做 UI 提示
- 后端做真正的解析和查询

---

### 25. 网络慢怎么优化?

**回答:**

**1. Loading Skeleton:**
```tsx
{isLoading ? <ProductSkeleton /> : <ProductCard />}
```

**2. 乐观更新:**
```tsx
const mutation = useMutation({
  mutationFn: addToCart,
  onMutate: async (newItem) => {
    // 立即更新 UI
    queryClient.setQueryData(['cart'], (old) => [...old, newItem]);
  },
  onError: (err, newItem, context) => {
    // 失败了回滚
    queryClient.setQueryData(['cart'], context.previousCart);
  }
});
```

**3. Retry 机制:**
```tsx
useQuery({
  queryKey: ['products'],
  queryFn: getProducts,
  retry: 3, // 失败重试 3 次
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
});
```

---

### 26. 为什么购物车不用 Debounce 防抖?

**回答:**
- 用户期望立即响应
- localStorage 写入很快

**追问: 如果是网络请求呢?**

应该防抖:
```tsx
import { useDebouncedCallback } from 'use-debounce';

const updateQuantity = useDebouncedCallback(
  async (productId, quantity) => {
    await fetchAPI(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },
  500 // 500ms 防抖
);
```

---

### 27. 如果要做国际化(i18n),怎么设计?

**回答:**

```tsx
// 1. 安装 react-i18next
import { useTranslation } from 'react-i18next';

// 2. 语言文件
// en.json
{
  "product": {
    "addToCart": "Add to Cart",
    "price": "Price: ${{amount}}"
  }
}

// zh.json
{
  "product": {
    "addToCart": "加入购物车",
    "price": "价格: ¥{{amount}}"
  }
}

// 3. 使用
function Product() {
  const { t } = useTranslation();
  return <button>{t('product.addToCart')}</button>;
}

// 4. 路由设计
// /en/products
// /zh/products
```

**其他方案:**
- **next-intl** (Next.js 专用)
- **FormatJS** (格式化数字、日期)

---

### 28. 为什么不用 CSS Modules?

**回答:**
- TailwindCSS 已经解决样式隔离
- 减少文件数量

**追问: TailwindCSS 类名太长怎么办?**

**方案1: @apply**
```css
/* styles.css */
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600;
}
```

**方案2: 组件抽象**
```tsx
const Button = ({ children, variant = 'primary' }) => {
  const classes = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white'
  };

  return (
    <button className={`px-4 py-2 rounded ${classes[variant]}`}>
      {children}
    </button>
  );
};
```

---

### 29. 如果要加深色模式,怎么实现?

**回答:**

```tsx
// 1. Context 管理主题
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 2. TailwindCSS 配置
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 或 'media' (跟随系统)
}

// 3. 使用
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  ...
</div>
```

---

### 30. 为什么不自己上传图片?

**回答:**
- Demo 项目,节省成本和开发时间
- 实际生产要做图片上传

**追问: 图片上传流程怎么设计?**

**方案1: 直传 S3 (推荐)**
```typescript
// 1. 前端请求预签名 URL
const { uploadUrl, imageUrl } = await fetch('/api/upload/presign', {
  method: 'POST',
  body: JSON.stringify({ filename: 'product.jpg', contentType: 'image/jpeg' })
}).then(r => r.json());

// 2. 前端直接上传到 S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. 后端生成预签名 URL
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const command = new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: `products/${userId}/${filename}`,
  ContentType: contentType
});

const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

**方案2: 后端中转(简单但性能差)**
```typescript
app.post('/upload', upload.single('image'), async (req, res) => {
  const file = req.file;

  // 验证
  if (file.size > 5 * 1024 * 1024) throw new Error('Too large');
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    throw new Error('Invalid type');
  }

  // 上传到 S3
  await s3.upload({
    Bucket: 'my-bucket',
    Key: `products/${file.filename}`,
    Body: file.buffer
  });

  res.json({ url: `https://cdn.example.com/${file.filename}` });
});
```

**优化:**
- **图片压缩**: Sharp 库(Node.js) 或 CloudFlare Images
- **CDN**: CloudFront / CloudFlare
- **尺寸限制**: 最大 5MB
- **格式限制**: jpg/png/webp
- **安全**: 验证真实文件类型(不只看扩展名)

---

## ⚙️ C. 后端深挖 (15题)

### 31. JWT 过期了怎么办?

**回答:**

```typescript
// 方案: Access Token (15分钟) + Refresh Token (7天)

// 1. 登录时返回两个 token
app.post('/auth/login', async (req, res) => {
  const user = await validateUser(req.body);

  const accessToken = jwt.sign(
    { userId: user.id },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Refresh Token 存数据库(可以撤销)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id }
  });

  res.cookie('refreshToken', refreshToken, { httpOnly: true });
  res.json({ accessToken });
});

// 2. Access Token 过期时刷新
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.cookies;

  // 验证 Refresh Token
  const payload = jwt.verify(refreshToken, REFRESH_SECRET);

  // 检查是否在数据库中(是否被撤销)
  const tokenExists = await prisma.refreshToken.findUnique({
    where: { token: refreshToken }
  });

  if (!tokenExists) throw new Error('Token revoked');

  // 生成新的 Access Token
  const accessToken = jwt.sign(
    { userId: payload.userId },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ accessToken });
});

// 3. 前端自动刷新
async function fetchWithAuth(url, options) {
  let token = localStorage.getItem('accessToken');

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include' // 带上 Refresh Token Cookie
  });

  // Access Token 过期,自动刷新
  if (res.status === 401) {
    const { accessToken } = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    }).then(r => r.json());

    localStorage.setItem('accessToken', accessToken);

    // 重试原请求
    res = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  return res;
}
```

**追问: Refresh Token 存哪?**
- **数据库** (可以撤销,比如用户登出/修改密码)
- 或 **Redis** (性能更好)

---

### 32. bcrypt salt rounds 设置多少?

**回答:**
```typescript
const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds
```

- **10 rounds** = 2^10 = 1024 次 hash
- 平衡安全性和性能:
  - 10 rounds: ~100ms (推荐)
  - 12 rounds: ~250ms
  - 14 rounds: ~1s

**追问: 服务器慢可以降低吗?**

**不行!** 安全第一

如果服务器慢,应该:
1. 异步处理(不阻塞主线程)
2. 限制注册频率(Rate Limiting)
3. 升级服务器

**原理:**
- Rounds 越高,破解成本越高(暴力破解耗时指数增长)
- 随着硬件性能提升,未来可能需要提高到 12

---

### 33. Rate Limiting 100/15min 够吗?

**回答:**
```typescript
import rateLimit from 'express-rate-limit';

// 全局限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: 'Too many requests'
});

app.use('/api', limiter);

// 登录接口更严格
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 最多5次
  skipSuccessfulRequests: true // 成功的不计数
});

app.post('/auth/login', loginLimiter, loginHandler);
```

**选择标准:**
- **普通 API**: 100/15min
- **登录/注册**: 5/15min
- **支付**: 10/hour

**追问: 如何防止 IP 伪造?**

1. **验证码** (Google reCAPTCHA)
2. **设备指纹** (fingerprint.js)
3. **行为分析** (检测机器人行为)
4. **结合多个维度**: IP + User-Agent + Cookie

---

### 34. Prisma N+1 查询问题?

**回答:**
```typescript
// ❌ N+1 问题
const users = await prisma.user.findMany(); // 1 query
for (const user of users) {
  const orders = await prisma.order.findMany({ // N queries
    where: { userId: user.id }
  });
}

// ✅ 方案1: include (JOIN)
const users = await prisma.user.findMany({
  include: { orders: true } // 1 query
});

// ✅ 方案2: 批量查询
const users = await prisma.user.findMany();
const userIds = users.map(u => u.id);
const orders = await prisma.order.findMany({
  where: { userId: { in: userIds } }
});
// 自己组装数据
```

**追问: GraphQL 的 N+1 怎么解决?**

```typescript
import DataLoader from 'dataloader';

// 创建 DataLoader
const orderLoader = new DataLoader(async (userIds) => {
  const orders = await prisma.order.findMany({
    where: { userId: { in: userIds } }
  });

  // 按 userId 分组
  const ordersByUserId = groupBy(orders, 'userId');
  return userIds.map(id => ordersByUserId[id] || []);
});

// GraphQL Resolver
const resolvers = {
  User: {
    orders: (user, args, { loaders }) => {
      return loaders.orderLoader.load(user.id); // 自动批量查询
    }
  }
};
```

---

### 35. 为什么没有事务?

**回答:**
- 简单场景不需要
- Prisma 支持事务:

```typescript
// 场景: 下单 + 扣库存 + 扣余额
await prisma.$transaction(async (tx) => {
  // 1. 创建订单
  const order = await tx.order.create({
    data: { userId, total }
  });

  // 2. 扣减库存
  const product = await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } }
  });

  // 检查库存
  if (product.stock < 0) {
    throw new Error('Out of stock');
  }

  // 3. 扣减用户余额
  await tx.user.update({
    where: { id: userId },
    data: { balance: { decrement: total } }
  });
});
```

**追问: 什么场景一定要事务?**

1. **支付 + 订单创建**
2. **转账** (A 扣钱 + B 加钱)
3. **库存扣减 + 订单创建**
4. **任何需要保证一致性的操作**

---

### 36. GraphQL N+1 问题?

参见 **#34 追问**

---

### 37. 为什么没有 API 文档?

**回答:**
- Demo 项目
- 实际会用 OpenAPI/Swagger
- GraphQL 自带文档(GraphiQL)

**实现 Swagger:**
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/products', getProducts);
```

---

### 38. 订单量大怎么优化数据库?

**回答:**

**1. 索引:**
```prisma
model Order {
  id        String   @id @default(cuid())
  userId    String
  status    String
  createdAt DateTime @default(now())

  @@index([userId]) // 查询用户订单
  @@index([status]) // 查询待支付订单
  @@index([createdAt]) // 按时间排序
  @@index([userId, status]) // 复合索引(最常用)
}
```

**2. 分库分表:**
- **垂直分表**: 订单基础信息 / 订单详情分开
- **水平分表**: 按时间分表(order_2024_01, order_2024_02)
- **分库**: 按用户 ID 哈希

```typescript
// 简单的分表逻辑
function getOrderTable(userId: string) {
  const hash = hashCode(userId) % 10; // 10个表
  return `order_${hash}`;
}
```

**3. 读写分离:**
- **主库**: 写操作
- **从库**: 读操作(多个从库负载均衡)

**4. 归档:**
- 3个月前的订单归档到冷存储(S3)

---

### 39. 为什么没有日志系统?

**回答:**
- console.log 够用
- 实际用 Winston/Pino + ELK

**实现:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 使用
logger.info('Order created', { orderId: '123', userId: 'abc' });
logger.error('Payment failed', { error: err.message });
```

**追问: 生产环境日志怎么收集?**
- **CloudWatch** (AWS)
- **Datadog** (全平台)
- **ELK Stack** (Elasticsearch + Logstash + Kibana)

---

### 40. Stripe Webhook 怎么验证签名?

**回答:**
```typescript
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, secret);

    // 处理事件
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSuccess(event.data.object);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

**追问: 如果验证失败怎么办?**
- 记录日志
- 告警(发邮件/Slack)
- 不处理该请求(防止伪造)

---

### 41. 为什么没有分布式锁?

**回答:**
- 单机部署,没有并发问题
- 高并发场景需要(防止库存超卖)

**追问: 库存扣减怎么防止超卖?**

**方案1: 乐观锁(version 字段)**
```typescript
// 1. 读取库存和版本号
const product = await prisma.product.findUnique({
  where: { id }
});

// 2. 更新时检查版本号
const updated = await prisma.product.updateMany({
  where: {
    id,
    version: product.version, // 必须匹配
    stock: { gte: quantity }  // 库存足够
  },
  data: {
    stock: { decrement: quantity },
    version: { increment: 1 }
  }
});

// 3. 如果更新失败(版本号不匹配),重试
if (updated.count === 0) {
  throw new Error('Stock changed, please retry');
}
```

**方案2: 悲观锁(FOR UPDATE)**
```typescript
await prisma.$transaction(async (tx) => {
  // 锁定该行
  const product = await tx.$queryRaw`
    SELECT * FROM products WHERE id = ${id} FOR UPDATE
  `;

  if (product.stock < quantity) {
    throw new Error('Out of stock');
  }

  await tx.product.update({
    where: { id },
    data: { stock: { decrement: quantity } }
  });
});
```

**方案3: Redis 分布式锁**
```typescript
import Redlock from 'redlock';

const lock = await redlock.acquire([`lock:product:${id}`], 5000);

try {
  const product = await getProduct(id);
  if (product.stock >= quantity) {
    await updateStock(id, -quantity);
  }
} finally {
  await lock.release();
}
```

---

### 42. 为什么没有消息队列?

**回答:**
- 同步处理足够快
- 实际场景:
  1. **订单创建 → 发邮件** (异步,用户不用等)
  2. **订单创建 → 发短信**
  3. **订单创建 → 推送通知**

**实现:**
```typescript
import { Queue, Worker } from 'bullmq';

// 1. 创建队列
const emailQueue = new Queue('email', {
  connection: { host: 'localhost', port: 6379 }
});

// 2. 下单时加入队列
app.post('/orders', async (req, res) => {
  const order = await createOrder(req.body);

  // 异步发邮件(不阻塞响应)
  await emailQueue.add('order-confirmation', {
    email: req.user.email,
    orderId: order.id
  });

  res.json({ order });
});

// 3. Worker 处理任务
const worker = new Worker('email', async (job) => {
  await sendEmail({
    to: job.data.email,
    subject: 'Order Confirmation',
    body: `Your order ${job.data.orderId} is confirmed`
  });
});
```

**常用消息队列:**
- **Redis (BullMQ)**: 轻量、简单
- **RabbitMQ**: 功能强大、可靠
- **AWS SQS**: 托管、无需维护
- **Kafka**: 高吞吐、日志流

---

### 43. 为什么没有 API 版本管理?

**回答:**
- Demo 不需要
- 实际:URL 版本号或 Header

**实现:**
```typescript
// 方案1: URL 版本号
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// 方案2: Header 版本号
app.use((req, res, next) => {
  const version = req.headers['api-version'] || '1';
  req.apiVersion = version;
  next();
});

app.get('/api/products', (req, res) => {
  if (req.apiVersion === '2') {
    return getProductsV2(req, res);
  }
  return getProductsV1(req, res);
});
```

---

### 44. 如果要做微服务拆分,怎么拆?

**回答:**

**服务划分:**
1. **用户服务** (认证、个人信息)
2. **商品服务** (商品CRUD、搜索)
3. **订单服务** (订单管理)
4. **支付服务** (Stripe集成)

**追问: 服务间通信?**

**方案1: REST API**
```typescript
// 订单服务调用商品服务
const product = await fetch('http://product-service/api/products/123').then(r => r.json());
```

**方案2: gRPC (更快)**
```typescript
// product.proto
service ProductService {
  rpc GetProduct (ProductRequest) returns (Product);
}

// 订单服务调用
const product = await productClient.GetProduct({ id: '123' });
```

**方案3: 消息队列(异步)**
```typescript
// 订单服务发布事件
await messageQueue.publish('order.created', { orderId: '123' });

// 库存服务订阅事件
messageQueue.subscribe('order.created', async (event) => {
  await reduceStock(event.orderId);
});
```

**追问: API Gateway?**
- **作用**: 统一入口、路由、认证、限流
- **工具**: Kong / AWS API Gateway / Nginx

---

### 45. 为什么没有异常监控?

**回答:**
- Demo 项目
- 实际必须有(Sentry/Rollbar)

**实现 Sentry:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// 自动捕获错误
app.use(Sentry.Handlers.errorHandler());

// 手动上报
try {
  await riskyOperation();
} catch (err) {
  Sentry.captureException(err);
}
```

---

## 🗄️ D. 数据库与性能 (10题)

### 46. 数据库有哪些索引?

**回答:**
```prisma
model User {
  id       String  @id @default(cuid())
  email    String  @unique // 自动索引
  password String
}

model Product {
  id    String   @id @default(cuid())
  slug  String   @unique // 自动索引
  title String
  tags  String[]
  price Int

  @@index([price]) // 价格范围查询
  @@index([tags]) // 标签过滤
  @@fulltext([title, description]) // 全文搜索
}

model Order {
  id        String   @id
  userId    String
  status    String
  createdAt DateTime

  @@index([userId, status]) // 复合索引(最常用查询)
  @@index([createdAt(sort: Desc)]) // 按时间排序
}
```

**追问: 为什么这些字段需要索引?**
- **email/slug**: 唯一查询(登录、产品详情页)
- **price**: 范围查询(`WHERE price BETWEEN 100 AND 500`)
- **tags**: 数组查询(`WHERE tags @> ['electronics']`)
- **userId + status**: 查询用户的待支付订单(最常见)
- **createdAt**: 排序和分页

**注意:**
- 索引不是越多越好(写入变慢)
- 只给**查询频繁的字段**加索引

---

### 47. 100万数据怎么优化查询?

**回答:**

**1. 索引(必须)**

**2. 分页(不要用 offset,用 cursor)**
```typescript
// ❌ offset 分页(慢)
SELECT * FROM products
LIMIT 20 OFFSET 100000; // 扫描10万行

// ✅ cursor 分页(快)
SELECT * FROM products
WHERE id > 'last_id'
LIMIT 20;

// Prisma 实现
const products = await prisma.product.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastId }
});
```

**3. 全文搜索(Elasticsearch)**
```typescript
// PostgreSQL 全文搜索
await prisma.$queryRaw`
  SELECT * FROM products
  WHERE to_tsvector('english', title || ' ' || description)
        @@ to_tsquery('english', ${query})
  LIMIT 20
`;

// 或者用 Elasticsearch
const results = await esClient.search({
  index: 'products',
  body: {
    query: {
      multi_match: {
        query: searchQuery,
        fields: ['title^2', 'description'] // title 权重更高
      }
    }
  }
});
```

**4. 缓存热门商品(Redis)**
```typescript
async function getProduct(id: string) {
  // 先查 Redis
  let product = await redis.get(`product:${id}`);

  if (!product) {
    // 查数据库
    product = await prisma.product.findUnique({ where: { id } });

    // 缓存 1 小时
    await redis.setex(`product:${id}`, 3600, JSON.stringify(product));
  }

  return JSON.parse(product);
}
```

---

### 48. 数据库连接池怎么配置?

**回答:**
```typescript
// Prisma 配置
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DATABASE_URL 中配置连接池
// postgresql://user:pass@host:5432/db?connection_limit=10

// 或者在代码中
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

**根据并发量调整:**
- **小型应用**: 10-20
- **中型应用**: 50-100
- **大型应用**: 100+

---

### 49. 如果要做数据备份,怎么做?

**回答:**
- **AWS RDS 自动备份**: 每天自动备份,保留7天
- **定期导出 SQL**:
```bash
# 导出
pg_dump -h host -U user -d ecommerce > backup.sql

# 恢复
psql -h host -U user -d ecommerce < backup.sql
```

**追问: 备份频率?灾难恢复 RTO/RPO?**
- **RPO (Recovery Point Objective)**: 可接受的数据丢失量
  - 金融系统: 0 (实时备份)
  - 普通应用: 1小时
- **RTO (Recovery Time Objective)**: 可接受的恢复时间
  - 关键系统: < 1小时
  - 普通应用: < 4小时

**策略:**
- 每天全量备份
- 每小时增量备份(WAL归档)
- 跨区域备份(防止区域故障)

---

### 50. PostgreSQL vs MySQL?

**回答:**

| 特性 | PostgreSQL | MySQL |
|------|-----------|-------|
| **事务** | ✅ 完整ACID | ✅ InnoDB支持 |
| **JSON** | ✅ jsonb(索引) | ❌ 慢 |
| **全文搜索** | ✅ 内置 | ❌ 需要插件 |
| **复杂查询** | ✅ 窗口函数、CTE | ❌ 弱 |
| **读性能** | 🟡 一般 | ✅ 很快 |
| **写性能** | ✅ 很快 | 🟡 一般 |
| **并发** | ✅ MVCC | 🟡 表锁 |
| **社区** | 🟡 较小 | ✅ 很大 |

**选择:**
- **PostgreSQL**: 复杂业务、需要 JSON、需要事务
- **MySQL**: 读多写少、简单CRUD、团队熟悉

---

### 51. 数据迁移怎么做?

**回答:**

**1. Prisma Migrate (开发环境)**
```bash
# 1. 修改 schema.prisma
model Product {
  + category String // 新字段
}

# 2. 生成迁移
npx prisma migrate dev --name add_category

# 3. 应用迁移
npx prisma migrate deploy
```

**2. 生产环境迁移(谨慎)**
```sql
-- 分步迁移,不中断服务

-- 步骤1: 添加新字段(可为空)
ALTER TABLE products ADD COLUMN category VARCHAR(255);

-- 步骤2: 后台脚本填充数据
UPDATE products SET category = 'electronics'
WHERE tags @> '["electronics"]';

-- 步骤3: 改为非空
ALTER TABLE products ALTER COLUMN category SET NOT NULL;

-- 步骤4: 添加索引
CREATE INDEX idx_category ON products(category);
```

**3. 蓝绿部署**
- 蓝色环境(旧版本) + 绿色环境(新版本)
- 数据库同时支持两个版本
- 逐步切换流量

**4. 回滚策略**
```bash
# Prisma 回滚
npx prisma migrate resolve --rolled-back migration_name
```

---

### 52. 数据库的 CASCADE 删除用了吗?

**回答:**
```prisma
model User {
  id     String  @id
  orders Order[]
}

model Order {
  id     String @id
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- **Cascade**: 删除用户 → 自动删除其所有订单
- **谨慎使用**: 可能误删重要数据
- **替代方案**: 软删除(deletedAt 字段)

---

### 53. 如果要做数据分析,怎么做?

**回答:**

**1. ETL → 数据仓库**
```typescript
// Extract: 从 PostgreSQL 提取
const orders = await prisma.order.findMany({
  where: { createdAt: { gte: yesterday } }
});

// Transform: 转换格式
const transformed = orders.map(o => ({
  date: o.createdAt.toISOString().split('T')[0],
  revenue: o.total,
  userId: o.userId
}));

// Load: 加载到 Redshift/Snowflake
await redshift.bulkInsert('orders_fact', transformed);
```

**2. BI 工具**
- **Metabase** (开源)
- **Superset** (开源)
- **Tableau** (商业)

**3. 实时分析**
- **ClickHouse** (OLAP数据库)
- **Druid** (时序数据)

---

### 54. 数据库的字符集是什么?

**回答:**
- **UTF-8**

**追问: 为什么不是 GBK?**
- **UTF-8** 支持全球所有语言
- **GBK** 只支持中文
- 国际化必须用 UTF-8

---

### 55. 如果要做数据脱敏,怎么做?

**回答:**

**1. 日志脱敏:**
```typescript
function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}

logger.info('User registered', {
  email: maskEmail(user.email),
  phone: maskPhone(user.phone)
});
```

**2. 测试环境假数据:**
```typescript
import { faker } from '@faker-js/faker';

await prisma.user.create({
  data: {
    email: faker.internet.email(),
    phone: faker.phone.number(),
    name: faker.person.fullName()
  }
});
```

**3. 数据库视图(限制敏感字段):**
```sql
CREATE VIEW users_public AS
SELECT id, email, name
FROM users;
-- 不包含 password, phone 等敏感字段
```

---

## 🚀 E. DevOps 与部署 (10题)

### 56. 为什么用 EC2 而不是 Lambda?

**回答:**

| 特性 | EC2 | Lambda |
|------|-----|--------|
| **冷启动** | ✅ 无 | ❌ 1-3秒 |
| **长连接** | ✅ 支持 | ❌ 不支持 |
| **成本** | 🟡 固定 | ✅ 按调用 |
| **运维** | ❌ 需要维护 | ✅ 无需维护 |
| **适用场景** | 持续运行的API | 偶尔调用的任务 |

**选择:**
- **EC2**: 稳定流量、需要 WebSocket、熟悉传统运维
- **Lambda**: 流量波动大、无状态、希望零运维

**追问: Lambda 冷启动怎么优化?**
1. **Provisioned Concurrency** (预热实例,但要钱)
2. **减小包体积** (只打包必要的依赖)
3. **用轻量运行时** (Node.js 比 Python 快)

---

### 57. Nginx 配置了什么?

**回答:**
```nginx
# /etc/nginx/sites-available/api.quickshop.fit

server {
  listen 80;
  server_name api.quickshop.fit;

  # 重定向到 HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.quickshop.fit;

  # SSL 证书
  ssl_certificate /etc/letsencrypt/live/api.quickshop.fit/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.quickshop.fit/privkey.pem;

  # 反向代理到 Node.js
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # 静态文件缓存
  location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Gzip 压缩
  gzip on;
  gzip_types text/plain application/json application/javascript text/css;
}
```

---

### 58. PM2 的作用?

**回答:**
```bash
# 启动应用
pm2 start dist/index.js --name ecommerce-api

# Cluster 模式(多进程)
pm2 start dist/index.js -i max # 根据 CPU 核心数

# 自动重启
pm2 startup # 开机自启动
pm2 save    # 保存当前进程列表

# 监控
pm2 monit

# 日志
pm2 logs
```

**功能:**
1. **进程管理**: 自动重启(crash 或内存泄漏)
2. **负载均衡**: Cluster 模式,充分利用多核
3. **零停机重启**: `pm2 reload` 逐个重启进程
4. **日志管理**: 自动分割日志

---

### 59. Let's Encrypt 自动续期?

**回答:**
```bash
# 1. 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 2. 获取证书
sudo certbot --nginx -d api.quickshop.fit

# 3. 自动续期(Cron Job)
sudo crontab -e

# 每天凌晨2点检查并续期
0 2 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

**原理:**
- Let's Encrypt 证书有效期 90 天
- Certbot 会在到期前 30 天自动续期
- `--post-hook` 续期后重启 Nginx

---

### 60. 如果服务器挂了怎么办?

**回答:**
- **PM2 自动重启**: 进程崩溃自动重启
- **实际生产**: 多实例 + 负载均衡(ELB)

**高可用架构:**
```
           ┌─────────────┐
           │  ELB (负载均衡)  │
           └──────┬──────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   ┌────▼────┐         ┌────▼────┐
   │  EC2-1  │         │  EC2-2  │
   │ (API)   │         │ (API)   │
   └────┬────┘         └────┬────┘
        │                   │
        └─────────┬─────────┘
                  │
           ┌──────▼──────┐
           │     RDS      │
           │ (Multi-AZ)  │
           └─────────────┘
```

---

### 61. CI/CD 流程?

**回答:**

**当前:**
- **前端**: GitHub push → Amplify 自动构建部署
- **后端**: 手动 SSH 登录 → `git pull && pm2 restart`

**改进: GitHub Actions 自动化后端部署**
```yaml
# .github/workflows/deploy.yml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/ecommerce-backend
            git pull origin main
            npm install
            npm run build
            pm2 restart all
```

---

### 62. 灰度发布怎么做?

**回答:**

**方案1: Nginx 流量分割**
```nginx
upstream backend {
  server 10.0.1.1:3000 weight=9; # 旧版本 90%
  server 10.0.1.2:3000 weight=1; # 新版本 10%
}

server {
  location / {
    proxy_pass http://backend;
  }
}
```

**方案2: Feature Flag**
```typescript
// 后端
const newFeatureEnabled = await featureFlags.isEnabled('new-checkout', userId);

if (newFeatureEnabled) {
  return newCheckout(req, res);
} else {
  return oldCheckout(req, res);
}

// 逐步开放:
// 1% 用户 → 10% → 50% → 100%
```

**方案3: Canary 部署 (Kubernetes)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  selector:
    app: backend
    version: stable # 90% 流量
---
apiVersion: v1
kind: Service
metadata:
  name: backend-canary
spec:
  selector:
    app: backend
    version: canary # 10% 流量
```

---

### 63. 监控和告警?

**回答:**

**当前: CloudWatch**
- CPU/内存/磁盘使用率
- RDS 连接数

**改进: Prometheus + Grafana**
```typescript
// 1. 安装 prom-client
import promClient from 'prom-client';

// 2. 定义指标
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status']
});

// 3. 中间件记录
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path, res.statusCode).observe(duration);
  });

  next();
});

// 4. 暴露指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

**告警(AlertManager):**
```yaml
# 慢请求告警
- alert: SlowRequests
  expr: http_request_duration_seconds{quantile="0.95"} > 1
  for: 5m
  annotations:
    summary: "95th percentile request duration > 1s"
```

---

### 64. AB 测试怎么做?

**回答:**
```typescript
// 1. 计算用户分组(一致性哈希)
function getVariant(userId: string, experimentName: string): 'A' | 'B' {
  const hash = hashCode(`${userId}:${experimentName}`);
  return hash % 2 === 0 ? 'A' : 'B';
}

// 2. 根据分组返回不同结果
app.get('/api/products', (req, res) => {
  const variant = getVariant(req.user.id, 'new-ranking-algorithm');

  if (variant === 'A') {
    // 旧算法
    const products = await getProductsOld();
  } else {
    // 新算法
    const products = await getProductsNew();
  }

  // 记录事件
  analytics.track('product_list_viewed', {
    userId: req.user.id,
    variant,
    productCount: products.length
  });

  res.json(products);
});

// 3. 分析结果
SELECT
  variant,
  COUNT(*) as views,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(purchased) as conversions,
  SUM(purchased) * 1.0 / COUNT(*) as conversion_rate
FROM events
WHERE experiment = 'new-ranking-algorithm'
GROUP BY variant;
```

**工具:**
- **自建**: 上面的方案
- **第三方**: Optimizely, LaunchDarkly, Firebase A/B Testing

---

### 65. Docker 在项目中的作用?

**回答:**
- **本地开发环境**: 一键启动 PostgreSQL
- **生产环境没用**: 直接 EC2 部署

**追问: 为什么不用 Docker 部署?**

**不用的原因:**
- 单体应用,不需要容器编排
- EC2 直接部署更简单

**如果要用:**
- **ECS (Elastic Container Service)**: AWS 托管容器
- **Kubernetes**: 微服务、多容器编排

---

## 🔒 F. 安全与最佳实践 (5题)

### 66. CORS 配置有什么问题?

**回答:**
```typescript
// ❌ 不安全(允许任何域名)
app.use(cors({ origin: '*' }));

// ✅ 限制域名
app.use(cors({
  origin: [
    'https://www.quickshop.fit',
    'https://quickshop.fit'
  ],
  credentials: true // 允许发送 Cookie
}));

// ✅ 动态验证
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://www.quickshop.fit'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

---

### 67. 如何防止 CSRF?

**回答:**

**方案1: CSRF Token**
```typescript
import csrf from 'csurf';

app.use(csrf({ cookie: true }));

// 前端获取 token
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 前端发送请求时带上
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'CSRF-Token': csrfToken
  },
  body: JSON.stringify(order)
});
```

**方案2: SameSite Cookie (更简单)**
```typescript
res.cookie('token', jwt, {
  httpOnly: true,
  sameSite: 'strict' // 禁止跨站发送
});
```

---

### 68. 如何防止 XSS?

**回答:**

**1. 输入验证**
```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/), // 只允许字母数字
  email: z.string().email()
});
```

**2. 输出转义(React 自动做)**
```tsx
// React 自动转义
<div>{userInput}</div>

// 如果真的要渲染 HTML(危险!)
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

**3. CSP Header**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // 生产环境去掉 unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  }
}));
```

---

### 69. 如何防止 SQL 注入?

**回答:**
- **Prisma**(参数化查询,自动防护)
- **永远不拼接 SQL**

```typescript
// ❌ 危险
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ 安全(Prisma)
await prisma.user.findUnique({ where: { email } });

// ✅ 安全(原生SQL - 参数化)
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

---

### 70. HTTPS 怎么保证安全?

**回答:**
- **TLS 加密**: 传输过程加密,防止窃听
- **证书验证**: 防止中间人攻击

**工作流程:**
1. **握手**: 客户端和服务器协商加密算法
2. **证书验证**: 客户端验证服务器证书(Let's Encrypt)
3. **密钥交换**: 使用非对称加密交换对称密钥
4. **加密传输**: 使用对称密钥加密数据

---

## 💡 面试回答策略

### 万能回答模板:
> "这个 Demo 项目中我用了 X,主要考虑是 Y。如果是生产环境,我会改成 Z,因为..."

### 面试官最想听到的:
1. **你知道问题在哪** (承认不足)
2. **你知道怎么改进** (展示能力)
3. **你理解权衡** (工程思维)
4. **你能快速学习** (成长潜力)

### 加分项:
- 主动提到项目的不足和改进方向
- 用数据说话(性能提升、成本节省)
- 展示对新技术的了解(即使没用过)
- 提到实际踩过的坑

---

**祝你面试顺利!** 🚀
