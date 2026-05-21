import prisma from '../prisma/db';
import { AppError } from '../middleware/error.middleware';

export const getAllProducts = async (filters: any) => {
  const { category, search, sort, page = 1, limit = 10, minPrice, maxPrice, minRating } = filters;
  const skip = (page - 1) * limit;
  const take = limit;

  const where: any = {};
  if (category) where.category = category;

  // Implement Price Range Filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  // Implement Rating Criteria Filters
  if (minRating !== undefined) {
    where.rating = { gte: Number(minRating) };
  }

  // Synonym map for Smart Search
  const synonymMap: Record<string, string> = {
    "tee": "Custom T-Shirts",
    "tees": "Custom T-Shirts",
    "shirt": "Custom T-Shirts",
    "shirts": "Custom T-Shirts",
    "tshirt": "Custom T-Shirts",
    "tshirts": "Custom T-Shirts",
    "t-shirt": "Custom T-Shirts",
    "t-shirts": "Custom T-Shirts",
    "slip": "Name Slips",
    "slips": "Name Slips",
    "sticker": "Name Slips",
    "stickers": "Name Slips",
    "name": "Name Slips",
    "names": "Name Slips",
    "bottle": "Printed Bottles",
    "bottles": "Printed Bottles",
    "flask": "Printed Bottles",
    "flasks": "Printed Bottles",
    "insulated": "Printed Bottles",
    "cup": "Custom Cups",
    "cups": "Custom Cups",
    "mug": "Custom Cups",
    "mugs": "Custom Cups",
    "coffee": "Custom Cups",
    "frame": "Photo Frames",
    "frames": "Photo Frames",
    "photo": "Photo Frames",
    "photos": "Photo Frames",
    "keychain": "Keychain",
    "keychains": "Keychain",
    "key": "Keychain",
    "keys": "Keychain",
    "ring": "Keychain",
    "rings": "Keychain",
    "chain": "Keychain",
    "notebook": "Stationery",
    "notebooks": "Stationery",
    "book": "Stationery",
    "books": "Stationery",
    "stationery": "Stationery",
    "pen": "Stationery",
    "pens": "Stationery",
    "paper": "Stationery",
    "gadget": "Tech Gadgets",
    "gadgets": "Tech Gadgets",
    "smart": "Tech Gadgets",
    "band": "Tech Gadgets",
    "bands": "Tech Gadgets",
    "tracker": "Tech Gadgets",
    "trackers": "Tech Gadgets",
    "tech": "Tech Gadgets"
  };

  if (search) {
    const searchString = String(search).trim();
    const words = searchString.toLowerCase().split(/\s+/).filter(Boolean);
    const matchedCategories = new Set<string>();

    words.forEach(w => {
      if (synonymMap[w]) {
        matchedCategories.add(synonymMap[w]);
      }
    });

    // Match exact combinations, split terms, or synonyms
    where.OR = [
      { name: { contains: searchString, mode: "insensitive" } },
      { description: { contains: searchString, mode: "insensitive" } },
      ...words.map(word => ({
        name: { contains: word, mode: "insensitive" }
      })),
      ...words.map(word => ({
        description: { contains: word, mode: "insensitive" }
      })),
    ];

    if (matchedCategories.size > 0) {
      where.OR.push({
        category: { in: Array.from(matchedCategories) }
      });
    }
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
};

export const getProductSuggestions = async (query: string) => {
  if (!query || !query.trim()) {
    return { products: [], categories: [], queries: [] };
  }

  const cleanQuery = query.trim();
  const searchWords = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const synonymMap: Record<string, string> = {
    "tee": "Custom T-Shirts",
    "tees": "Custom T-Shirts",
    "shirt": "Custom T-Shirts",
    "shirts": "Custom T-Shirts",
    "tshirt": "Custom T-Shirts",
    "tshirts": "Custom T-Shirts",
    "t-shirt": "Custom T-Shirts",
    "t-shirts": "Custom T-Shirts",
    "slip": "Name Slips",
    "slips": "Name Slips",
    "sticker": "Name Slips",
    "stickers": "Name Slips",
    "name": "Name Slips",
    "names": "Name Slips",
    "bottle": "Printed Bottles",
    "bottles": "Printed Bottles",
    "flask": "Printed Bottles",
    "flasks": "Printed Bottles",
    "insulated": "Printed Bottles",
    "cup": "Custom Cups",
    "cups": "Custom Cups",
    "mug": "Custom Cups",
    "mugs": "Custom Cups",
    "coffee": "Custom Cups",
    "frame": "Photo Frames",
    "frames": "Photo Frames",
    "photo": "Photo Frames",
    "photos": "Photo Frames",
    "keychain": "Keychain",
    "keychains": "Keychain",
    "key": "Keychain",
    "keys": "Keychain",
    "ring": "Keychain",
    "rings": "Keychain",
    "chain": "Keychain",
    "notebook": "Stationery",
    "notebooks": "Stationery",
    "book": "Stationery",
    "books": "Stationery",
    "stationery": "Stationery",
    "pen": "Stationery",
    "pens": "Stationery",
    "paper": "Stationery",
    "gadget": "Tech Gadgets",
    "gadgets": "Tech Gadgets",
    "smart": "Tech Gadgets",
    "band": "Tech Gadgets",
    "bands": "Tech Gadgets",
    "tracker": "Tech Gadgets",
    "trackers": "Tech Gadgets",
    "tech": "Tech Gadgets"
  };

  const matchedCategories = new Set<string>();
  searchWords.forEach(w => {
    if (synonymMap[w]) matchedCategories.add(synonymMap[w]);
  });

  const allCategories = [
    "Custom T-Shirts",
    "Name Slips",
    "Printed Bottles",
    "Custom Cups",
    "Photo Frames",
    "Keychain",
    "Stationery",
    "Tech Gadgets"
  ];

  allCategories.forEach(cat => {
    if (cat.toLowerCase().includes(cleanQuery.toLowerCase())) {
      matchedCategories.add(cat);
    }
  });

  const OR_conditions: any[] = [
    { name: { contains: cleanQuery, mode: "insensitive" } },
    { category: { contains: cleanQuery, mode: "insensitive" } },
  ];

  if (matchedCategories.size > 0) {
    OR_conditions.push({
      category: { in: Array.from(matchedCategories) }
    });
  }

  const products = await prisma.product.findMany({
    where: {
      OR: OR_conditions
    },
    take: 5,
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      images: true,
    }
  });

  const categories = Array.from(matchedCategories).slice(0, 3);
  const queries: string[] = [];
  
  if (products.length > 0) {
    products.forEach(p => {
      if (queries.length < 3 && !queries.includes(p.name)) {
        queries.push(p.name);
      }
    });
  }
  
  categories.forEach(cat => {
    if (queries.length < 3 && !queries.includes(cat)) {
      queries.push(`Shop ${cat}`);
    }
  });

  return {
    products,
    categories,
    queries: queries.slice(0, 3)
  };
};

export const getSingleProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) throw new AppError('Product not found', 404);
  return product;
};

export const createProductService = async (data: any) => {
  const product = await prisma.product.create({ data });
  try {
    await prisma.notification.create({
      data: {
        title: "New Product Available!",
        message: `A brand-new product "${product.name}" has just arrived! Grab yours now.`,
        productId: product.id,
      }
    });

    if (product.stock > 0) {
      await prisma.stockHistory.create({
        data: {
          productId: product.id,
          quantity: product.stock,
          prevStock: 0,
          newStock: product.stock,
          reason: "Product Created with Initial Stock",
          actor: "Admin",
        }
      });
    }
  } catch (err) {
    console.error("Failed to generate new product notification or initial stock history:", err);
  }
  return product;
};

export const updateProductService = async (id: string, data: any, actorEmail?: string) => {
  const currentProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!currentProduct) {
    throw new AppError('Product not found', 404);
  }

  // Ensure lowStockThreshold is processed as integer if provided
  if (data.lowStockThreshold !== undefined) {
    data.lowStockThreshold = parseInt(data.lowStockThreshold);
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
  });

  // Log stock history change
  if (data.stock !== undefined && data.stock !== currentProduct.stock) {
    const diff = data.stock - currentProduct.stock;
    try {
      await prisma.stockHistory.create({
        data: {
          productId: id,
          quantity: diff,
          prevStock: currentProduct.stock,
          newStock: updatedProduct.stock,
          reason: diff > 0 ? "Manual Restock" : "Manual Adjustment",
          actor: actorEmail || "Admin",
        }
      });

      // Fire low stock warning on manual decreases
      if (updatedProduct.stock <= updatedProduct.lowStockThreshold) {
        await prisma.notification.create({
          data: {
            title: `⚠️ Low Stock Alert: ${updatedProduct.name}`,
            message: `Product "${updatedProduct.name}" is running low. Current stock is ${updatedProduct.stock} (Threshold: ${updatedProduct.lowStockThreshold}). Please replenish soon!`,
            productId: updatedProduct.id,
          }
        });
      }
    } catch (err) {
      console.error("Failed to write manual stock update log:", err);
    }
  }

  return updatedProduct;
};

export const deleteProductService = async (id: string) => {
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { productId: id } }),
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.order.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
};

export const checkUserCanReview = async (userId: string, productId: string) => {
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId
    }
  });

  if (existingReview) {
    return false;
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      productId,
      status: { in: ['CONFIRMED', 'DELIVERED', 'SHIPPED', 'PACKED'] }
    }
  });

  return !!order;
};

export const addProductReview = async (userId: string, productId: string, rating: number, comment: string) => {
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId
    }
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this product", 400);
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      productId,
      status: { in: ['CONFIRMED', 'DELIVERED', 'SHIPPED', 'PACKED'] }
    }
  });

  if (!order) {
    throw new AppError("You can only review products after your order is confirmed", 403);
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId,
      productId
    }
  });

  const reviews = await prisma.review.findMany({ where: { productId } });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { rating: avgRating }
    });
  } catch (err) {
    console.error("Failed to update product rating:", err);
  }

  return review;
};
