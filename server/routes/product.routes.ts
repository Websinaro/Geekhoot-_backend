import express from "express";
import * as productController from "../controllers/product.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = express.Router();

router.get("/", productController.getProducts);
router.get("/suggestions", productController.getSearchSuggestions);
router.get("/:id", productController.getProductById);

// Protected Admin Routes
router.post("/", protect, adminOnly, upload.single('image'), productController.createProduct);
router.put("/:id", protect, adminOnly, upload.single('image'), productController.updateProduct);
router.delete("/:id", protect, adminOnly, productController.deleteProduct);

// Review Routes
router.post("/:productId/reviews", protect, productController.addReview);
router.get("/:productId/can-review", protect, productController.checkCanReview);

export default router;
