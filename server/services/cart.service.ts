import prisma from '../prisma/db';

export const getUserCart = async (userId: string) => {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
};

export const addItemToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  }

  return await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity,
    },
  });
};

export const updateItemInCart = async (id: string, quantity: number) => {
  return await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });
};

export const deleteItemFromCart = async (id: string) => {
  return await prisma.cartItem.delete({ where: { id } });
};

export const clearUserCart = async (userId: string) => {
  return await prisma.cartItem.deleteMany({ where: { userId } });
};
