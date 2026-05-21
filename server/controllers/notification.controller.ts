import { Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service";

export const getMyNotifications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await notificationService.markNotificationRead(id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
