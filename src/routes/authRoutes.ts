import express, { RequestHandler } from "express";
import { AuthController } from "../controllers/authController";
import { requireAuth, requireAuthv2 } from "../middlewares/auth";
import { createAuthRateLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

// We need an async IIFE or dynamic application for the async rate limiter initialization
createAuthRateLimiter()
  .then((authLimiter) => {
    router.post("/register", authLimiter, AuthController.register as any);

    router.post("/login", authLimiter, AuthController.Login as any);

    router.post("/send-otp", authLimiter, AuthController.sendOTP as any);
  })
  .catch((err) =>
    console.error("Failed to initialize auth rate limiter:", err),
  );

router.post("/logout", requireAuthv2 as any, AuthController.logOut as any);

router.post("/verify-otp", AuthController.sendOTP as any);

router.post("/sync-user", requireAuthv2 as any, AuthController.syncUser as any);
router.post("/refresh-token", AuthController.refreshToken as any);
router.get("/google", (req, res) => {
  const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=email%20profile&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(url);
});
router.get("/google/callback", AuthController.callbackGoogle as any);
router.get("/google/success", AuthController.callbackGoogle as any);

router.post(
  "/google/success-google",

  requireAuth as any,
  // upload.single("avatar"),
  AuthController.successGoogle as any,
);

export default router;
