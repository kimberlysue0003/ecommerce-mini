// Database seed script
// Populates database with sample products matching frontend mock data

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  await prisma.userBehavior.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Created demo users');

  // Create products matching frontend mock data
  const products = await prisma.product.createMany({
    data: [
      // Headphones / Audio
      {
        slug: 'bt-headset-01',
        title: 'Bluetooth Headphones Pro',
        description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life',
        price: 49900,
        tags: ['headphones', 'bluetooth', 'wireless', 'audio'],
        stock: 12,
        rating: 4.5,
      },
      {
        slug: 'bt-headset-02',
        title: 'Wireless Headphones Lite',
        description: 'Comfortable wireless headphones for everyday use',
        price: 29900,
        tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
        stock: 20,
        rating: 4.2,
      },
      {
        slug: 'anc-headset-01',
        title: 'ANC Over-Ear Headphones',
        description: 'Studio-quality over-ear headphones with advanced noise cancellation',
        price: 89900,
        tags: ['headphones', 'anc', 'noise-cancelling', 'audio'],
        stock: 8,
        rating: 4.6,
      },

      // Keyboards
      {
        slug: 'mech-kb-01',
        title: 'Mechanical Keyboard 87',
        description: 'Tenkeyless mechanical keyboard with tactile switches',
        price: 29900,
        tags: ['keyboard', 'mechanical', 'tkl'],
        stock: 5,
        rating: 4.2,
      },
      {
        slug: 'mech-kb-60',
        title: '60% Compact Mechanical Keyboard',
        description: 'Ultra-compact 60% layout for minimalist setups',
        price: 25900,
        tags: ['keyboard', 'mechanical', 'compact'],
        stock: 10,
        rating: 4.1,
      },
      {
        slug: 'mech-kb-100',
        title: 'Full-size Mechanical Keyboard',
        description: 'Full-size mechanical keyboard with numpad and RGB backlighting',
        price: 39900,
        tags: ['keyboard', 'mechanical', 'fullsize'],
        stock: 6,
        rating: 4.4,
      },

      // Mice
      {
        slug: 'mouse-lite',
        title: 'Lightweight Gaming Mouse',
        description: 'Ultra-lightweight gaming mouse with precise sensor',
        price: 15900,
        tags: ['mouse', 'gaming', 'lightweight'],
        stock: 20,
        rating: 4.1,
      },
      {
        slug: 'mouse-wireless',
        title: 'Wireless Mouse Silent',
        description: 'Silent wireless mouse perfect for office environments',
        price: 19900,
        tags: ['mouse', 'wireless', 'office'],
        stock: 25,
        rating: 4.0,
      },

      // Speakers & Audio
      {
        slug: 'spk-01',
        title: 'Desktop Speaker',
        description: 'Compact desktop speakers with rich sound quality',
        price: 39900,
        tags: ['speaker', 'audio', 'desktop'],
        stock: 8,
        rating: 4.3,
      },
      {
        slug: 'spk-soundbar',
        title: 'PC Soundbar with RGB',
        description: 'Sleek soundbar with customizable RGB lighting',
        price: 34900,
        tags: ['speaker', 'soundbar', 'audio', 'rgb'],
        stock: 9,
        rating: 4.2,
      },

      // Monitors
      {
        slug: 'monitor-27',
        title: '27" Monitor 144Hz',
        description: '27-inch gaming monitor with 144Hz refresh rate',
        price: 129900,
        tags: ['monitor', '144hz', 'gaming'],
        stock: 6,
        rating: 4.6,
      },
      {
        slug: 'monitor-24',
        title: '24" IPS Monitor',
        description: '24-inch IPS monitor with accurate color reproduction',
        price: 89900,
        tags: ['monitor', 'ips', 'office'],
        stock: 10,
        rating: 4.3,
      },

      // Webcam / Mic
      {
        slug: 'webcam-4k',
        title: '4K Webcam',
        description: '4K Ultra HD webcam for professional streaming',
        price: 89900,
        tags: ['webcam', 'camera', 'video'],
        stock: 7,
        rating: 4.4,
      },
      {
        slug: 'webcam-1080',
        title: '1080p Autofocus Webcam',
        description: '1080p webcam with autofocus and low-light correction',
        price: 39900,
        tags: ['webcam', 'camera', 'video'],
        stock: 12,
        rating: 4.1,
      },
      {
        slug: 'mic-usb',
        title: 'USB Condenser Microphone',
        description: 'Professional USB microphone for streaming and podcasting',
        price: 69900,
        tags: ['microphone', 'usb', 'audio', 'streaming'],
        stock: 9,
        rating: 4.3,
      },

      // Hubs / Accessories
      {
        slug: 'usb-c-hub',
        title: 'USB-C Hub 7-in-1',
        description: '7-in-1 USB-C hub with HDMI, USB ports, and SD card reader',
        price: 19900,
        tags: ['hub', 'usbc', 'accessory'],
        stock: 30,
        rating: 4.2,
      },
      {
        slug: 'sd-reader',
        title: 'USB-C SD Card Reader',
        description: 'High-speed USB-C SD card reader supporting UHS-II',
        price: 12900,
        tags: ['reader', 'usbc', 'accessory'],
        stock: 40,
        rating: 4.0,
      },

      // Chairs
      {
        slug: 'chair-ergonomic',
        title: 'Ergonomic Chair',
        description: 'Premium ergonomic office chair with lumbar support',
        price: 259900,
        tags: ['chair', 'ergonomic', 'office'],
        stock: 4,
        rating: 4.5,
      },
      {
        slug: 'chair-mesh',
        title: 'Mesh Office Chair',
        description: 'Breathable mesh office chair for all-day comfort',
        price: 199900,
        tags: ['chair', 'office', 'mesh'],
        stock: 7,
        rating: 4.2,
      },

      // Additional keyboard
      {
        slug: 'kb-lowprofile',
        title: 'Low-Profile Wireless Keyboard',
        description: 'Slim wireless keyboard with low-profile switches',
        price: 34900,
        tags: ['keyboard', 'wireless', 'low-profile'],
        stock: 14,
        rating: 4.1,
      },
    ],
  });

  console.log('✅ Created products');

  // Create some demo cart items
  const allProducts = await prisma.product.findMany({ take: 3 });

  for (const product of allProducts) {
    await prisma.cartItem.create({
      data: {
        userId: demoUser.id,
        productId: product.id,
        quantity: 1,
      },
    });
  }

  console.log('✅ Created demo cart items');

  // Create a demo order
  const orderProducts = await prisma.product.findMany({ take: 2 });
  const orderTotal = orderProducts.reduce((sum, p) => sum + p.price, 0);

  const demoOrder = await prisma.order.create({
    data: {
      userId: demoUser.id,
      total: orderTotal,
      status: 'PAID',
      items: {
        create: orderProducts.map(p => ({
          productId: p.id,
          quantity: 1,
          price: p.price,
        })),
      },
    },
  });

  console.log('✅ Created demo order');

  // Create some user behavior data
  const behaviorProducts = await prisma.product.findMany({ take: 5 });

  for (const product of behaviorProducts) {
    await prisma.userBehavior.create({
      data: {
        userId: demoUser.id,
        productId: product.id,
        action: 'VIEW',
      },
    });
  }

  console.log('✅ Created user behavior data');

  console.log('🎉 Database seed completed successfully!');
  console.log('\nDemo accounts:');
  console.log('  Email: demo@example.com');
  console.log('  Email: admin@example.com');
  console.log('  Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
