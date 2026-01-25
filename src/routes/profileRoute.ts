import { Router } from "express"
import { ProfileController } from "../controllers/profileController"
import { requireAuth } from "../middlewares/auth"
import multer from "multer"

// import { upload } from "../app"

const router = Router()



router.put(


  "/profile/update",
  // upload.single("avatar"),
  requireAuth as any,
  (req, res, next) => {

    console.log("=== BEFORE MULTER ===")
    console.log("Content-Type:", req.headers["content-type"])
    console.log("Content-Length:", req.headers["content-length"])
    console.log("===================")
    next()
  },
  // upload.any(),
  (req, res, next) => {
    console.log("=== AFTER MULTER ===")
    console.log("Body keys:", req.body ? Object.keys(req.body) : "No body")
    console.log("Files count:", req.files ? (req.files as any[]).length : 0)
    console.log("==================")
    next()
  },
  ProfileController.create_Update as any,
)

router.post("/profile/create", requireAuth as any, ProfileController.create_Update as any)

export default router
