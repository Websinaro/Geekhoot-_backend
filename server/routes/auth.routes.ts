import express from "express";
import * as authController from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/register", authController.signup); // support client-side alias
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/verify-code", authController.verifyCode);
router.post("/resend-code", authController.resendCode);
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);

export default router;
