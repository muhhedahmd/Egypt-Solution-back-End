"use strict";
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
exports.TokenService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../lib/jwt");
class TokenService {
    static generateTokenPair(userId_1, userAgent_1, ipAddress_1) {
        return __awaiter(this, arguments, void 0, function* (userId, userAgent, ipAddress, needAvatar = false) {
            var _a, _b, _c;
            try {
                // Get user data for access token
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    include: {
                        profile: {
                            select: {
                                id: true,
                                isProfileComplete: true,
                            },
                        },
                    },
                });
                if (!user)
                    throw new Error("User not found");
                let avatarUrl = "";
                if (needAvatar) {
                    const avatar = yield prisma_1.default.profile.findUnique({
                        where: {
                            userId: userId, // assuming userId is unique in profile model
                        },
                        select: {
                            avatar: {
                                select: {
                                    url: true,
                                },
                            },
                        },
                    });
                    avatarUrl = ((_a = avatar === null || avatar === void 0 ? void 0 : avatar.avatar) === null || _a === void 0 ? void 0 : _a.url) || "";
                }
                // Generate tokens (assumes these functions create tokens but don't persist expiration themselves)
                const accessToken = (0, jwt_1.generateAccessToken)({
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailConfirmation: user.emailConfirmed,
                    deviceVerification: true,
                    profileId: (_b = user.profile) === null || _b === void 0 ? void 0 : _b.id,
                    profileComplete: (_c = user.profile) === null || _c === void 0 ? void 0 : _c.isProfileComplete,
                    avatarUrl: avatarUrl || ""
                });
                const refreshToken = (0, jwt_1.generateRefreshToken)(userId);
                const session = yield prisma_1.default.session.create({
                    data: {
                        userId,
                        token: accessToken,
                        refreshToken,
                        refreshTokenExpiresAt: new Date(Date.now() + TokenService.REFRESH_TOKEN_TTL_MS), // 30 days
                        userAgent: userAgent || "",
                        ipAddress: ipAddress || "",
                        deviceVerification: true,
                        expiresAt: new Date(Date.now() + TokenService.ACCESS_TOKEN_TTL_MS), // access token expires at (24 hours)
                        isActive: true,
                    },
                });
                return {
                    accessToken,
                    refreshToken,
                    sessionId: session.id,
                    expiresIn: Math.floor(TokenService.ACCESS_TOKEN_TTL_MS / 1000), // in seconds
                    refreshExpiresIn: Math.floor(TokenService.REFRESH_TOKEN_TTL_MS / 1000), // in seconds
                };
            }
            catch (error) {
                console.error("Generate token pair error:", error);
                return null;
            }
        });
    }
    static refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Verify refresh token (your verifyRefreshToken should return payload with userId or null on fail)
                const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
                if (!decoded) {
                    return { error: "Invalid refresh token" };
                }
                // Find active session for this refresh token
                const session = yield prisma_1.default.session.findFirst({
                    where: {
                        refreshToken,
                        userId: decoded.userId,
                        isActive: true,
                        refreshTokenExpiresAt: {
                            gt: new Date(), // Not expired
                        },
                    },
                    include: {
                        user: {
                            include: {
                                profile: {
                                    select: {
                                        id: true,
                                        isProfileComplete: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!session) {
                    throw new Error("Refresh token not found or expired");
                }
                // Generate new access token
                const newAccessToken = (0, jwt_1.generateAccessToken)({
                    userId: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    role: session.user.role,
                    emailConfirmation: session.user.emailConfirmed,
                    deviceVerification: session.deviceVerification,
                    profileId: (_a = session.user.profile) === null || _a === void 0 ? void 0 : _a.id,
                    profileComplete: (_b = session.user.profile) === null || _b === void 0 ? void 0 : _b.isProfileComplete,
                });
                // If you want to rotate refresh tokens uncomment this and use generateRefreshToken:
                // const newRefreshToken = generateRefreshToken(session.user.id)
                // Update session with new access token and (optionally) new refresh token expiry
                yield prisma_1.default.session.update({
                    where: { id: session.id }, // only id is required & correct for Prisma
                    data: {
                        token: newAccessToken,
                        // If rotating refresh tokens, set refreshToken: newRefreshToken
                        // refreshToken: newRefreshToken,
                        // extend refresh token expiry only if you want sliding expiration (optional)
                        refreshTokenExpiresAt: new Date(Date.now() + TokenService.REFRESH_TOKEN_TTL_MS), // extend 30 days from now (optional)
                        expiresAt: new Date(Date.now() + TokenService.ACCESS_TOKEN_TTL_MS), // new access token expiry (24 hours)
                    },
                });
                return {
                    accessToken: newAccessToken,
                    refreshToken: refreshToken, // or newRefreshToken if you rotate
                    expiresIn: Math.floor(TokenService.ACCESS_TOKEN_TTL_MS / 1000),
                    user: {
                        id: session.user.id,
                        name: session.user.name,
                        email: session.user.email,
                        role: session.user.role,
                    },
                };
            }
            catch (error) {
                console.error("Refresh token error:", error);
                return { error: "Failed to refresh token" };
            }
        });
    }
    // 🚪 Logout (invalidate tokens)
    static logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.session.updateMany({
                    where: { refreshToken },
                    data: { isActive: false },
                });
                return { success: true };
            }
            catch (error) {
                console.error("Logout error:", error);
                return { error: "Failed to logout" };
            }
        });
    }
    static logoutAllDevices(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.session.updateMany({
                    where: { userId },
                    data: { isActive: false },
                });
                return { success: true };
            }
            catch (error) {
                console.error("Logout all devices error:", error);
                return { error: "Failed to logout all devices" };
            }
        });
    }
    static cleanExpiredTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield prisma_1.default.session.deleteMany({
                    where: {
                        OR: [
                            { refreshTokenExpiresAt: { lt: new Date() } },
                            { isActive: false },
                        ],
                    },
                });
                console.log(`Cleaned ${result.count} expired sessions`);
                return result.count;
            }
            catch (error) {
                console.error("Clean expired tokens error:", error);
                return 0;
            }
        });
    }
}
exports.TokenService = TokenService;
// Use 24 hours for access tokens, 30 days for refresh tokens
TokenService.ACCESS_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
TokenService.REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
