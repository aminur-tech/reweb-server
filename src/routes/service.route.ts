import express from "express";
import { serviceControllers } from "../controllers/service.controller";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

// Public route
router.get("/", serviceControllers.getServices);

// Admin-only routes
router.post("/", isAdmin, serviceControllers.createService);
router.patch("/:id", isAdmin, serviceControllers.updateService);
router.delete("/:id", isAdmin, serviceControllers.deleteService);

export const ServiceRoutes = router;