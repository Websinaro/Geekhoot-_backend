import { Response, NextFunction } from "express";
import * as wishlistService from "../services/wishlist.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const list = await wishlistService.getUserWishlist(req.user.id);
    res.json(list);
  } catch (error: any) {
    next(error);
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.body;
  try {
    const result = await wishlistService.toggleWishlistItem(req.user.id, productId);
    res.json(result);
  } catch (error: any) {
    next(error);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  try {
    await wishlistService.removeWishlistItem(req.user.id, productId);
    res.json({ message: "Item removed from wishlist" });
  } catch (error: any) {
    next(error);
  }
};

export const clearWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await wishlistService.clearUserWishlist(req.user.id);
    res.json({ message: "Wishlist cleared" });
  } catch (error: any) {
    next(error);
  }
};
