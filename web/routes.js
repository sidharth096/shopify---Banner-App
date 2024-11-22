import express from "express";
import { createBanner, deleteBanner, editBanner, getBanner, getBannerDetails } from "./controller/bannerController.js";

const router = express.Router();

router.post("/createBanner", createBanner) 
router.get("/getBanners", getBanner)
router.delete("/deleteBanner/:id", deleteBanner)
router.get("/getBannerDetails/:id", getBannerDetails)
router.put("/editBanner/:id", editBanner)
export default router;  