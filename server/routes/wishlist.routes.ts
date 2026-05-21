import express from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect); // All wishlist routes are protected

router.get("/", wishlistController.getWishlist);
router.post("/toggle", wishlistController.toggleWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);
router.delete("/", wishlistController.clearWishlist);

export default router;
