import express from "express";
import * as cartController from "../controllers/cart.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect); // All cart routes are protected

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
