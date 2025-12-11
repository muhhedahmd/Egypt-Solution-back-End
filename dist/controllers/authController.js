"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userServics_1 = require("../services/userServics");
const tokenService_1 = require("../services/tokenService");
const axios_1 = __importDefault(require("axios"));
const jwt = __importStar(require("jsonwebtoken"));
const isProd = process.env.NODE_ENV === "production";
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, role, gender } = req.body;
                const userCreated = yield userServics_1.userService.create({
                    name,
                    email,
                    password,
                    role,
                    gender,
                });
                if (typeof userCreated === "string")
                    return res.status(500).json({ error: userCreated });
                if (!userCreated)
                    return res.status(500).json({ error: "Internal server error" });
                const tokens = yield tokenService_1.TokenService.generateTokenPair(userCreated.id, req.headers["user-agent"] || "", req.ip || req.socket.remoteAddress || "");
                if (!tokens)
                    return res.status(500).json({ error: "Internal server error" });
                return res
                    .cookie(isProd ? "__secure-refreshToken" : "refreshToken", tokens.refreshToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                })
                    .cookie(isProd ? "__secure-accessToken" : "accessToken", tokens.accessToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                })
                    .status(201)
                    .json({ success: true, user: userCreated });
            }
            catch (error) {
                return res
                    .status(500)
                    .json(error.message
                    ? { message: error.message }
                    : { message: "Internal server error" });
            }
        });
    }
    static Login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield userServics_1.userService.login({ email, password });
                if (!user)
                    return res.status(500).json({ error: "Internal server error" });
                if (typeof user === "string")
                    return res.status(500).json({ error: user });
                const tokens = yield tokenService_1.TokenService.generateTokenPair(user.id, req.headers["user-agent"] || "", req.ip || req.socket.remoteAddress || "");
                if (!tokens)
                    return res.status(500).json({ error: "Internal server error" });
                return res
                    .cookie(isProd ? "__secure-refreshToken" : "refreshToken", tokens.refreshToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: tokens.refreshExpiresIn * 1000,
                })
                    .cookie(isProd ? "__secure-accessToken" : "accessToken", tokens.accessToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: tokens.expiresIn * 1000,
                })
                    .status(201)
                    .json({ success: true, user });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static sendOTP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, method } = req.body;
                if (!userId || !method) {
                    return res.status(400).json({
                        error: "User ID and method are required",
                    });
                }
                const result = yield userServics_1.userService.sendOTP({
                    Method: method,
                    userId,
                });
                console.log("Service result:", result);
                if (typeof result === "string") {
                    return res.status(400).json({ error: result });
                }
                if (!result) {
                    return res.status(500).json({ error: "Internal server error" });
                }
                if (result === null || result === void 0 ? void 0 : result.error) {
                    return res.status(500).json({
                        success: false,
                        message: "something went worng",
                        data: result,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "OTP sent successfully",
                    data: result,
                });
            }
            catch (error) {
                console.error("SendOTP Controller Error:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
                console.log("Refresh token:", refreshToken);
                if (!refreshToken) {
                    return res.status(400).json({ error: "Refresh token is required" });
                }
                const { accessToken, error, expiresIn, user } = yield tokenService_1.TokenService.refreshAccessToken(refreshToken);
                if (error) {
                    return res.status(401).json({ error: error });
                }
                return res
                    .cookie(isProd ? "__secure-refreshToken" : "refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                })
                    .cookie(isProd ? "__secure-accessToken" : "accessToken", accessToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 15 * 60 * 1000,
                })
                    .status(200)
                    .json(user);
            }
            catch (error) {
                console.error("Refresh token controller error:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static callbackGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = req.query.code;
            const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback`;
            if (!code) {
                return res.status(400).json({ error: "Missing code from Google" });
            }
            try {
                const tokenRes = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: redirectUri,
                    grant_type: "authorization_code",
                });
                const { access_token, id_token } = tokenRes.data;
                if (!id_token) {
                    return res
                        .status(400)
                        .json({ error: "Failed to get ID token from Google" });
                }
                console.log({ access_token });
                const decoded = jwt.decode(id_token);
                const { email, name, picture, sub: googleId } = decoded;
                if (!email) {
                    return res
                        .status(400)
                        .json({ error: "Missing email in Google response" });
                }
                const user = yield userServics_1.userService.findOrCreateFromGoogle({
                    email,
                    name,
                    image: picture,
                    googleId,
                });
                console.log({ user });
                if (!user) {
                    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
                    return;
                }
                const tokens = yield tokenService_1.TokenService.generateTokenPair(user.id, req.headers["user-agent"] || "unknown", req.ip || req.socket.remoteAddress || "unknown", true);
                if (!tokens) {
                    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
                    return;
                }
                res.cookie(isProd ? "__secure-refreshToken" : "refreshToken", tokens.refreshToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.cookie(isProd ? "__secure-accessToken" : "accessToken", tokens.accessToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 15 * 60 * 1000,
                });
                res.redirect(`${process.env.FRONTEND_URL}/auth/success-google?token=${tokens.accessToken}`);
            }
            catch (err) {
                console.error("Google Auth Error:", err);
                res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
            }
        });
    }
    static successGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId)
                    res.status(404).json({ message: "user not found" });
                const contentType = req.headers["content-type"] || "";
                let formData;
                if (contentType.includes("multipart/form-data")) {
                    formData = req.body;
                }
                if (!formData)
                    res.status(500).json({
                        message: "innvalid Data",
                    });
                const avatar = (_c = req.file) === null || _c === void 0 ? void 0 : _c.buffer;
                console.log("before", formData, {
                    avatar: avatar || null,
                    userId,
                    bio: formData === null || formData === void 0 ? void 0 : formData.bio,
                    role: formData === null || formData === void 0 ? void 0 : formData.role,
                    dateOfBirth: formData === null || formData === void 0 ? void 0 : formData.dateOfBirth,
                    gender: formData === null || formData === void 0 ? void 0 : formData.gender,
                    phone: formData === null || formData === void 0 ? void 0 : formData.phone,
                });
                const response = yield userServics_1.userService.successGoogle({
                    avatar: avatar || null,
                    userId,
                    bio: formData === null || formData === void 0 ? void 0 : formData.bio,
                    role: formData === null || formData === void 0 ? void 0 : formData.role,
                    dateOfBirth: formData === null || formData === void 0 ? void 0 : formData.dateOfBirth,
                    gender: formData === null || formData === void 0 ? void 0 : formData.gender,
                    phone: formData === null || formData === void 0 ? void 0 : formData.phone,
                });
                res.status(200).json({
                    response,
                    message: "success",
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static syncUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log({ body: req.body });
                const { supabaseUserId, email, emailVerficatiion, provider } = req.body;
                if (!supabaseUserId)
                    return res.status(500).json({ error: "Internal server error" });
                const user = yield userServics_1.userService.syncUser({
                    supabaseUserId,
                    email,
                    emailVerficatiion,
                    provider,
                });
                if (!user)
                    return res.status(500).json({ error: "Internal server error" });
                const tokens = yield tokenService_1.TokenService.generateTokenPair(user.id, req.headers["user-agent"] || "", req.ip || req.socket.remoteAddress || "", false);
                res.cookie(isProd ? "__secure-refreshToken" : "refreshToken", tokens === null || tokens === void 0 ? void 0 : tokens.refreshToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.cookie(isProd ? "__secure-accessToken" : "accessToken", tokens === null || tokens === void 0 ? void 0 : tokens.accessToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                    maxAge: 15 * 60 * 1000,
                });
                return res.status(201).json(user);
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
    static verifyOTP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, Method, otp } = req.body;
                if (!userId || !Method || !otp)
                    return res.status(500).json({ error: "Internal server error" });
                const user = yield userServics_1.userService.verifyOtp(otp, Method, userId);
                if (typeof user === "string")
                    return res.status(500).json({ error: user });
                if (!user)
                    return res.status(500).json({ error: "Internal server error" });
            }
            catch (error) {
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.AuthController = AuthController;
