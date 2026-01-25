"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middlewares/auth");
// import { upload } from "../app"
const router = (0, express_1.Router)();
router.put("/profile/update", 
// upload.single("avatar"),
auth_1.requireAuth, (req, res, next) => {
    console.log("=== BEFORE MULTER ===");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Content-Length:", req.headers["content-length"]);
    console.log("===================");
    next();
}, 
// upload.any(),
(req, res, next) => {
    console.log("=== AFTER MULTER ===");
    console.log("Body keys:", req.body ? Object.keys(req.body) : "No body");
    console.log("Files count:", req.files ? req.files.length : 0);
    console.log("==================");
    next();
}, profileController_1.ProfileController.create_Update);
router.post("/profile/create", auth_1.requireAuth, profileController_1.ProfileController.create_Update);
exports.default = router;
