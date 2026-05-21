import prisma from "../prisma/db";

export const getNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: {
      OR: [
        { userId: null },
        { userId }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const markNotificationRead = async (id: string) => {
  return await prisma.notification.update({
    where: { id },
    data: { read: true }
  });
};

export const createGlobalNotification = async (title: string, message: string, productId?: string) => {
  return await prisma.notification.create({
    data: {
      title,
      message,
      productId
    }
  });
};
