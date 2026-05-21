import prisma from '../prisma/db';
import { AppError } from '../middleware/error.middleware';

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderByIdService = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, user: true },
  });

  if (!order) throw new AppError('Order not found', 404);

  if (order.userId !== userId && role !== 'ADMIN') {
    throw new AppError('Not authorized to view this order', 403);
  }

  return order;
};

export const createOrderService = async (userId: string, data: any) => {
  const { orderCode, locationUrl, ...orderData } = data;
  const finalOrderCode = orderCode || Math.random().toString(36).substring(2, 10).toUpperCase();

  const productId = orderData.productId;
  const quantity = parseInt(orderData.quantity) || 1;

  if (!productId) {
    throw new AppError('Product ID is required to place an order', 400);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current product safely
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // 2. Check stock level
    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items left in stock`, 400);
    }

    // 3. Decrement stock & increment bookings
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
        bookings: {
          increment: quantity,
        },
      },
    });

    // 3.5 Record Stock History
    await tx.stockHistory.create({
      data: {
        productId,
        quantity: -quantity,
        prevStock: product.stock,
        newStock: updatedProduct.stock,
        reason: `Auto Stock Reduction (Order #${finalOrderCode})`,
        actor: "System",
      }
    });

    // 3.6 Check for low stock alert
    if (updatedProduct.stock <= updatedProduct.lowStockThreshold) {
      await tx.notification.create({
        data: {
          title: `⚠️ Low Stock Alert: ${updatedProduct.name}`,
          message: `Product "${updatedProduct.name}" is running low. Current stock is ${updatedProduct.stock} (Threshold: ${updatedProduct.lowStockThreshold}). Please replenish soon!`,
          productId: updatedProduct.id,
        }
      });
    }

    // 4. Create and return order
    return await tx.order.create({
      data: {
        ...orderData,
        quantity,
        userId,
        orderCode: finalOrderCode,
        locationUrl,
      },
    });
  });
};

export const updateOrderService = async (id: string, data: any) => {
  return await prisma.order.update({
    where: { id },
    data,
  });
};

export const getAllOrdersService = async () => {
  return await prisma.order.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};
