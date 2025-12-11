import express, { Request, Response } from "express"
import { AuthController } from "../controllers/authController"
import multer from "multer"
import { requireAuth } from "../middlewares/auth"
const router = express.Router()



const upload = multer({
  storage: multer.memoryStorage(),
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
    })
    cb(null, true) // Accept all files
  },
})

// Public routes
// router.post("/register", AuthController.register as any)
// router.post("/login", AuthController.Login as any)
router.post("/send-otp", AuthController.sendOTP as any)
router.post("/verify-otp", AuthController.sendOTP as any)
router.post("/sync-user", AuthController.syncUser as any)
router.post("/refresh-token",
  AuthController.refreshToken as any
);
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
router.get("/google/callback",
  AuthController.callbackGoogle as any
);
router.get("/google/success",
  AuthController.callbackGoogle as any
);

router.post("/google/success-google",

  requireAuth as any,
  upload.single("avatar"),
  AuthController.successGoogle as any
);


export default router
