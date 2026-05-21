import { Response, NextFunction } from "express";
import * as orderService from "../services/order.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error: any) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderByIdService(req.params.id, req.user.id, req.user.role);
    res.json(order);
  } catch (error: any) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId || req.user.id;
    
    // Authorization check already in controller is good
    if (userId !== req.user.id && req.user.role !== "ADMIN") {
       return res.status(403).json({ message: "Not authorized to create order for another user" });
    }

    const order = await orderService.createOrderService(userId, req.body);
    res.status(201).json(order);
  } catch (error: any) {
    next(error);
  }
};

export const updateOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateOrderService(req.params.id, req.body);
    res.json(order);
  } catch (error: any) {
    next(error);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getAllOrdersService();
    res.json(orders);
  } catch (error: any) {
    next(error);
  }
};
