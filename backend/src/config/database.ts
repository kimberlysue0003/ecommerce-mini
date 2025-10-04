// Database connection configuration using Prisma
// Handles connection pooling and graceful shutdown

import { PrismaClient } from '@prisma/client';
import { isDevelopment } from './env.js';

// Create Prisma Client instance with logging in development
export const prisma = new PrismaClient({
  log: isDevelopment() ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test database connection
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection error:', error);
    process.exit(1);
  }
}

// Handle application termination signals
process.on('SIGINT', disconnectDatabase);
process.on('SIGTERM', disconnectDatabase);
