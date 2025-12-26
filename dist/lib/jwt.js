"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = ({ userId, email, role, name, emailConfirmation, deviceVerification, profileId, profileComplete, avatarUrl, }) => {
    return jsonwebtoken_1.default.sign({
        userId,
        email,
        role,
        name,
        emailConfirmation,
        deviceVerification,
        profileId,
        profileComplete,
        avatarUrl,
        type: "access",
    }, process.env.JWT_SECRET, { expiresIn: "30D" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({
        userId,
        type: "refresh",
    }, process.env.JWT_REFRESH_SECRET, { expiresIn: "3d" });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === "string")
            return null;
        if (decoded.type !== "access")
            return null;
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        if (typeof decoded === "string")
            return null;
        if (decoded.type !== "refresh")
            return null;
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
exports.generateToken = exports.generateAccessToken;
