// GraphQL Schema Definition
// Defines all types, queries, and mutations

export const typeDefs = `#graphql
  # Product type
  type Product {
    id: ID!
    slug: String!
    title: String!
    description: String
    price: Int!
    tags: [String!]!
    stock: Int!
    rating: Float!
    imageUrl: String
    createdAt: String!
    updatedAt: String!
  }

  # User type
  type User {
    id: ID!
    email: String!
    name: String
    createdAt: String!
  }

  # Cart item type
  type CartItem {
    id: ID!
    userId: String!
    productId: String!
    quantity: Int!
    product: Product!
    createdAt: String!
    updatedAt: String!
  }

  # Order item type
  type OrderItem {
    id: ID!
    productId: String!
    quantity: Int!
    price: Int!
    product: ProductSummary!
  }

  # Product summary for orders
  type ProductSummary {
    id: ID!
    title: String!
    slug: String!
    imageUrl: String
  }

  # Order type
  type Order {
    id: ID!
    userId: String!
    total: Int!
    status: OrderStatus!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  # Order status enum
  enum OrderStatus {
    PENDING
    PAID
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  # Auth payload
  type AuthPayload {
    token: String!
    user: User!
  }

  # Pagination info
  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  # Paginated products response
  type ProductsResponse {
    products: [Product!]!
    pagination: PaginationInfo!
  }

  # Paginated orders response
  type OrdersResponse {
    orders: [Order!]!
    pagination: PaginationInfo!
  }

  # AI search response
  type AISearchResponse {
    query: String!
    results: [Product!]!
  }

  # Input types
  input ProductFilterInput {
    search: String
    tags: [String!]
    minPrice: Int
    maxPrice: Int
    minRating: Float
    inStock: Boolean
  }

  input CartItemInput {
    productId: ID!
    quantity: Int!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  # Queries
  type Query {
    # Product queries
    products(filter: ProductFilterInput, page: Int, limit: Int): ProductsResponse!
    product(id: ID!): Product
    productBySlug(slug: String!): Product

    # Auth queries
    me: User

    # Cart queries
    cart: [CartItem!]!

    # Order queries
    orders(page: Int, limit: Int): OrdersResponse!
    order(id: ID!): Order

    # AI queries
    aiSearch(query: String!, limit: Int): AISearchResponse!
    similarProducts(productId: ID!, limit: Int): [Product!]!
    recommendations(limit: Int): [Product!]!
    popularProducts(limit: Int): [Product!]!
  }

  # Mutations
  type Mutation {
    # Auth mutations
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Cart mutations
    addToCart(productId: ID!, quantity: Int!): CartItem!
    updateCartItem(itemId: ID!, quantity: Int!): CartItem
    removeFromCart(itemId: ID!): Boolean!
    clearCart: Boolean!

    # Order mutations
    createOrder(items: [OrderItemInput!]): Order!
  }
`;
