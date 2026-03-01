import express, { RequestHandler } from "express";
import { AuthController } from "../controllers/authController";
import { requireAuth, requireAuthv2 } from "../middlewares/auth";
import { createAuthRateLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

// We need an async IIFE or dynamic application for the async rate limiter initialization
createAuthRateLimiter()
  .then((authLimiter) => {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     tags: [Authentication]
     *     summary: Register a new user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       201:
     *         description: User registered successfully
     *       400:
     *         description: Validation error
     *       429:
     *         description: Too many registration attempts
     */
    router.post("/register", authLimiter, AuthController.register as any);

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     tags: [Authentication]
     *     summary: Login user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: User logged in successfully
     *       401:
     *         description: Invalid credentials
     *       429:
     *         description: Too many login attempts
     */
    router.post("/login", authLimiter, AuthController.Login as any);

    /**
     * @swagger
     * /api/auth/send-otp:
     *   post:
     *     tags: [Authentication]
     *     summary: Send OTP for verification
     *     responses:
     *       200:
     *         description: OTP sent
     *       429:
     *         description: Too many attempts
     */
    router.post("/send-otp", authLimiter, AuthController.sendOTP as any);
  })
  .catch((err) =>
    console.error("Failed to initialize auth rate limiter:", err),
  );

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", requireAuthv2 as any, AuthController.logOut as any);

router.post("/verify-otp", AuthController.sendOTP as any);

/**
 * @swagger
 * /api/auth/sync-user:
 *   post:
 *     tags: [Authentication]
 *     summary: Sync authenticated user data
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sync successful
 *       401:
 *         description: Unauthorized
 */
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
