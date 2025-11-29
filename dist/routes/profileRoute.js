"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const auth_1 = require("../middlewares/auth");
const multer_1 = __importDefault(require("multer"));
// import { upload } from "../app"
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        fieldSize: 10 * 1024 * 1024, // 10MB for text fields
        files: 10, // Allow multiple files
        fields: 100, // Allow many fields
        parts: 1000, // Allow many parts
    },
    fileFilter: (req, file, cb) => {
        console.log("🔍 Multer processing file:", {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
        });
        cb(null, true); // Accept all files
    },
});
router.put("/profile/update", upload.single("avatar"), auth_1.requireAuth, (req, res, next) => {
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
