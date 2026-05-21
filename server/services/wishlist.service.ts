import prisma from '../prisma/db';

export const getUserWishlist = async (userId: string) => {
  return await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const toggleWishlistItem = async (userId: string, productId: string) => {
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: { id: existingItem.id },
    });
    return { added: false };
  }

  await prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
  });
  return { added: true };
};

export const removeWishlistItem = async (userId: string, productId: string) => {
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: { id: existingItem.id },
    });
    return { success: true };
  }

  return { success: false };
};

export const clearUserWishlist = async (userId: string) => {
  return await prisma.wishlistItem.deleteMany({
    where: { userId },
  });
};
