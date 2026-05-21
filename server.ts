import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./server/config/app.config";
import { errorHandler } from "./server/middleware/error.middleware";

// Routes
import authRoutes from "./server/routes/auth.routes";
import productRoutes from "./server/routes/product.routes";
import cartRoutes from "./server/routes/cart.routes";
import orderRoutes from "./server/routes/order.routes";
import adminRoutes from "./server/routes/admin.routes";
import notificationRoutes from "./server/routes/notification.routes";
import wishlistRoutes from "./server/routes/wishlist.routes";

const isProd = config.nodeEnv === "production";

const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = config.corsOrigin === "*"
  ? true
  : config.corsOrigin.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(isProd ? "combined" : "dev"));

// Static files for uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Error Handler (Must be last)
app.use(errorHandler);

app.listen(Number(config.port), "0.0.0.0", () => {
  console.log(`🚀 API server running at http://0.0.0.0:${config.port} (${config.nodeEnv})`);
});
