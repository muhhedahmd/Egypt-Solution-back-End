"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProfileComplete = void 0;
const requireProfileComplete = (req, res, next) => {
    if (!req.user || !req.user.profileComplete) {
        return res.status(403).json({ error: "Please complete your profile first" });
    }
    next();
};
exports.requireProfileComplete = requireProfileComplete;
