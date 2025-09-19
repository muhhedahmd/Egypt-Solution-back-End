import type { Request, Response } from "express"
import { userService } from "../services/userServics"

export class ProfileController {
  static async create_Update(req: Request, res: Response) {
    try {

      
      // Log all form fields
      if (req.body) {
        console.log("Form fields received:")
        Object.keys(req.body).forEach(key => {
          console.log(`  ${key}: ${req.body[key]}`)
        })
      }
      

      const contentType = req.headers["content-type"] || ""
      
      if (!contentType.includes("multipart/form-data")) {
        return res.status(400).json({
          error: "Content type must be multipart/form-data for file uploads",
          received: contentType,
        })
      }

      // Get form data
      const formData = req.body || {}
      
      if (!formData.userId) {
        return res.status(400).json({
          error: "userId is required",
          receivedFields: Object.keys(formData),
        })
      }

      // Handle file - check multiple ways files might be sent
      let avatarBuffer: Buffer | null = null
      
      if (req.files && Array.isArray(req.files)) {
        // console.log("Files found in req.files array:", req.files.length)

        
        // Look for avatar file by fieldname
        const avatarFile = req.files.find(file => 
          file.fieldname === 'avatar' || 
          file.fieldname === 'image' || 
          file.fieldname === 'file'
        )
        
        if (avatarFile) {
          avatarBuffer = avatarFile.buffer
          // console.log("Avatar file found:", avatarFile.originalname)
        }
      } else if (req.file) {
        // console.log("Single file found in req.file:", req.file.originalname)
        avatarBuffer = req.file.buffer
      }


      const profileData = {
        userId: formData.userId,
        RemoveAvatar: formData.RemoveAvatar === 'true',
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        bio: formData.bio || null,
        avatar: avatarBuffer,
      }

     

      const createOrUpdate = await userService.CreateProfile(profileData as any)

      if (!createOrUpdate) {
        return res.status(500).json({
          error: "Failed to create/update profile",
        })
      }

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: createOrUpdate,
      })
    } catch (error: any) {
      console.error("Profile Controller Error:", error)
      return res.status(500).json({
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
    }
  }
}
