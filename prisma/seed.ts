import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PRODUCTS_DATA = [
  {
    name: "Custom Graphic Tech Tee",
    description: "Express yourself with our premium combed cotton custom printed t-shirts. Send us your design or use our creator tool for stunning visual results. Soft, comfortable, and highly durable double-needle stitching.",
    price: 499,
    originalPrice: 799,
    category: "Custom T-Shirts",
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600"],
    stock: 50,
    rating: 4.8,
    bookings: 12,
  },
  {
    name: "Designer Sticker Name Slips",
    description: "Pack of 48 personalized designer sticker name slips for school, books, or office stationery. Water-resistant, smudge-proof, and designed with fun tech-forward themes.",
    price: 129,
    originalPrice: 199,
    category: "Name Slips",
    images: ["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600"],
    stock: 100,
    rating: 4.7,
    bookings: 35,
  },
  {
    name: "Personalized Insulated Flask (750ml)",
    description: "Premium double-wall vacuum insulated stainless steel water bottle. Keeps your drinks cold for 24 hours and hot for 12 hours. Custom laser engraving or high-definition permanent print of your name or artwork.",
    price: 699,
    originalPrice: 999,
    category: "Printed Bottles",
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600"],
    stock: 30,
    rating: 4.9,
    bookings: 18,
  },
  {
    name: "Premium Ceramic Photo Mug",
    description: "High-grade 11oz ceramic mug coated in beautiful gloss white. Features advanced wrap-around dye sublimation printing for gorgeous, microwave safe photo colors. Ideal for gifts, offices, and coffee lovers.",
    price: 249,
    originalPrice: 399,
    category: "Custom Cups",
    images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"],
    stock: 40,
    rating: 4.6,
    bookings: 24,
  },
  {
    name: "Classic Wood Frame Display",
    description: "Solid pinewood collage photo frame featuring high-clarity front-facing plexiglass. Comes with premium matte border overlays and secure back hooks for horizontal or vertical wall hanging.",
    price: 399,
    originalPrice: 599,
    category: "Photo Frames",
    images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600"],
    stock: 25,
    rating: 4.5,
    bookings: 8,
  },
  {
    name: "Engraved Leather Keychain",
    description: "Rustic full-grain leather strap paired with a heavy-duty gunmetal key ring. Personalize with your initials or a small text message. A timeless accessory made to age beautifully.",
    price: 149,
    originalPrice: 249,
    category: "Keychain",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"],
    stock: 80,
    rating: 4.8,
    bookings: 15,
  },
  {
    name: "Personalized Hardcover Notebook",
    description: "Premium ivory-color 100 gsm paper (160 ruled pages) bound inside a customizable, durable soft-touch hardcover. Features an elastic enclosure band and ribbon placeholder. Make it yours with custom gold-foil letters on the cover.",
    price: 349,
    originalPrice: 499,
    category: "Stationery",
    images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"],
    stock: 60,
    rating: 4.7,
    bookings: 10,
  },
  {
    name: "Bio-Link Smart Tracker Band",
    description: "The ultimate lifestyle wrist tracker. Displays real-time notifications, monitors stress signals, activity habits, and includes a built-in light display. Completely customizable straps and personalized interface.",
    price: 1299,
    originalPrice: 1999,
    category: "Tech Gadgets",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600"],
    stock: 15,
    rating: 4.4,
    bookings: 5,
  },
];

async function main() {
  // 1. Create Admin
  const adminPassword = await bcrypt.hash('asdfghjkl', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@geekhoot.com' },
    update: {},
    create: {
      email: 'admin@geekhoot.com',
      name: 'geekhoot',
      phone: '910000000000',
      password: adminPassword,
      role: 'ADMIN',
      address: 'Admin Headquarters',
      district: 'Ernakulam',
      state: 'Kerala',
      pincode: '682001',
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Create products if database is empty
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    console.log('Pre-populating product catalog...');
    for (const prod of PRODUCTS_DATA) {
      await prisma.product.create({
        data: prod
      });
    }
    console.log('Product catalog successfully seeded!');
  } else {
    console.log('Product catalog already contains data. Skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
