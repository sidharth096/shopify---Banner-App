import express from "express";
import { createBanner } from "./controller/bannerController.js";

const router = express.Router();

router.get("/createBanner", createBanner) 
export default router;