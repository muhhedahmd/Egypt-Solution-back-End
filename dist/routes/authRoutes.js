"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
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
// Public routes
router.post("/register", authController_1.AuthController.register);
router.post("/login", authController_1.AuthController.Login);
router.post("/send-otp", authController_1.AuthController.sendOTP);
router.post("/verify-otp", authController_1.AuthController.sendOTP);
router.post("/sync-user", authController_1.AuthController.syncUser);
router.post("/refresh-token", authController_1.AuthController.refreshToken);
router.get("/google", (req, res) => {
    const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=email%20profile&` +
        `access_type=offline&` + // to get refresh_token
        `prompt=consent`;
    res.redirect(url);
});
router.get("/google/callback", authController_1.AuthController.callbackGoogle);
router.get("/google/success", authController_1.AuthController.callbackGoogle);
router.post("/google/success-google", auth_1.requireAuth, upload.single("avatar"), authController_1.AuthController.successGoogle);
exports.default = router;
