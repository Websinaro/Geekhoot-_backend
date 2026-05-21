import prisma from '../prisma/db';

export const getStatsService = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue, 
    totalOrders, 
    totalUsers, 
    totalProducts,
    prevRevenue,
    prevOrders,
    prevUsers
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } }
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.count(),
    // Previous period stats
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        status: { not: 'CANCELLED' },
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
      }
    }),
    prisma.order.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    }),
    prisma.user.count({
      where: { 
        role: 'USER',
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
      }
    })
  ]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(1));
  };

  const currentRevenue = totalRevenue._sum.totalAmount || 0;
  const pastRevenue = prevRevenue._sum.totalAmount || 0;

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, district: true } },
      product: { select: { name: true, price: true } }
    }
  });

  const stockAlerts = await prisma.product.findMany({
    where: { stock: { lt: 5 } },
    take: 5,
    orderBy: { stock: 'asc' }
  });

  return {
    revenue: currentRevenue,
    revenueGrowth: calculateGrowth(currentRevenue, pastRevenue),
    orders: totalOrders,
    ordersGrowth: calculateGrowth(totalOrders, prevOrders),
    users: totalUsers,
    usersGrowth: calculateGrowth(totalUsers, prevUsers),
    products: totalProducts,
    productsGrowth: 0,
    recentOrders,
    stockAlerts
  };
};

export const getInventoryHistoryService = async () => {
  return await prisma.stockHistory.findMany({
    include: {
      product: {
        select: {
          name: true,
          category: true,
          images: true,
          stock: true,
          lowStockThreshold: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};
