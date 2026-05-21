import express from "express";
import * as orderController from "../controllers/order.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);

router.get("/my", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);

// Admin Routes
router.get("/", adminOnly, orderController.getAllOrders);
router.post("/", orderController.createOrder);
router.put("/:id", adminOnly, orderController.updateOrder);

export default router;
