import express from "express";
import { createBanner, getBanner } from "./controller/bannerController.js";

const router = express.Router();

router.post("/createBanner", createBanner) 
router.get("/getBanners", getBanner)
export default router;