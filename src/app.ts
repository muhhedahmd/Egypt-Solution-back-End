import express from "express"
import cors from "cors"
import multer from "multer"
import { uploadRouter } from "./uploadthing"
import { createRouteHandler } from "uploadthing/express"

// Import routes
import authRoutes from "./routes/authRoutes"
import ProfileRoutes from "./routes/profileRoute"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser";
import { ServicesModule } from "./services/service-parts/service.module"
import prisma from "./config/prisma"
import { errorHandler } from "./middlewares/errorHandler"
import { slideShowModules } from "./services/slideShow/slidwshow.modules"

const app = express()
app.use(cookieParser());

// 1. CORS first
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)

// 2. Configure multer properly
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use(upload.any()); // Accept any file uploads


// 3. Body parsing middleware for non-multipart requests
app.use(express.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }))

// 4. UploadThing route
app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: {
      isDev: true,
    },
  }),
)

// 5. Auth routes (no files)
app.use("/api/auth", authRoutes)
app.use("/api" ,  ProfileRoutes)

// Mount modules
const servicesModule = new ServicesModule(prisma);
const slideShowModule = new slideShowModules(prisma);
app.use('/api/services', servicesModule.getRoutes());
app.use('/api/slide-show', slideShowModule.getRoutes());


app.use(errorHandler as any);

// 7. Error handling middleware1
app.use((err: any, req: any, res: any, next: any) => {
  console.error("=== ERROR HANDLER ===")
  console.error("Error:", err.message)
  console.error("Code:", err.code)
  console.error("Stack:", err.stack)
  console.error("====================")

  if (err instanceof multer.MulterError) {
    console.error("Multer Error Details:", {
      code: err.code,
      field: err.field,
      message: err.message,
    })

    return res.status(400).json({
      error: "File upload error",
      message: err.message,
      code: err.code,
    })
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Unexpected file field",
      message: "File field not expected or wrong field name",
    })
  }

  if (err.message?.includes("Unexpected end of form")) {
    return res.status(400).json({
      error: "Form parsing error",
      message: "The form data was incomplete or corrupted",
      suggestion: "Check your form data and try again",
    })
  }

  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  })
})

export default app
