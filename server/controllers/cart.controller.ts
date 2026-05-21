import { Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cartItems = await cartService.getUserCart(req.user.id);
    res.json(cartItems);
  } catch (error: any) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const item = await cartService.addItemToCart(req.user.id, productId, quantity);
    res.status(201).json(item);
  } catch (error: any) {
    next(error);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const updatedItem = await cartService.updateItemInCart(id, quantity);
    res.json(updatedItem);
  } catch (error: any) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    await cartService.deleteItemFromCart(id);
    res.json({ message: "Item removed from cart" });
  } catch (error: any) {
    next(error);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await cartService.clearUserCart(req.user.id);
    res.json({ message: "Cart cleared" });
  } catch (error: any) {
    next(error);
  }
};
