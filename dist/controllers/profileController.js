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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const userServics_1 = require("../services/userServics");
class ProfileController {
    static create_Update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Log all form fields
                if (req.body) {
                    console.log("Form fields received:");
                    Object.keys(req.body).forEach(key => {
                        console.log(`  ${key}: ${req.body[key]}`);
                    });
                }
                const contentType = req.headers["content-type"] || "";
                if (!contentType.includes("multipart/form-data")) {
                    return res.status(400).json({
                        error: "Content type must be multipart/form-data for file uploads",
                        received: contentType,
                    });
                }
                // Get form data
                const formData = req.body || {};
                if (!formData.userId) {
                    return res.status(400).json({
                        error: "userId is required",
                        receivedFields: Object.keys(formData),
                    });
                }
                // Handle file - check multiple ways files might be sent
                let avatarBuffer = null;
                if (req.files && Array.isArray(req.files)) {
                    // console.log("Files found in req.files array:", req.files.length)
                    // Look for avatar file by fieldname
                    const avatarFile = req.files.find(file => file.fieldname === 'avatar' ||
                        file.fieldname === 'image' ||
                        file.fieldname === 'file');
                    if (avatarFile) {
                        avatarBuffer = avatarFile.buffer;
                        // console.log("Avatar file found:", avatarFile.originalname)
                    }
                }
                else if (req.file) {
                    // console.log("Single file found in req.file:", req.file.originalname)
                    avatarBuffer = req.file.buffer;
                }
                const profileData = {
                    userId: formData.userId,
                    RemoveAvatar: formData.RemoveAvatar === 'true',
                    phone: formData.phone || null,
                    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
                    bio: formData.bio || null,
                    avatar: avatarBuffer,
                };
                const createOrUpdate = yield userServics_1.userService.CreateProfile(profileData);
                if (!createOrUpdate) {
                    return res.status(500).json({
                        error: "Failed to create/update profile",
                    });
                }
                return res.json({
                    success: true,
                    message: "Profile updated successfully",
                    data: createOrUpdate,
                });
            }
            catch (error) {
                console.error("Profile Controller Error:", error);
                return res.status(500).json({
                    error: error.message || "Internal server error",
                    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
                });
            }
        });
    }
}
exports.ProfileController = ProfileController;
