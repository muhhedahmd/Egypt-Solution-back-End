"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const uploadthing_1 = require("./uploadthing");
const express_2 = require("uploadthing/express");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const profileRoute_1 = __importDefault(require("./routes/profileRoute"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const service_module_1 = require("./services/service-parts/service.module");
const prisma_1 = __importDefault(require("./config/prisma"));
const errorHandler_1 = require("./middlewares/errorHandler");
const slidwshow_modules_1 = require("./services/slideShow/slidwshow.modules");
const project_modules_1 = require("./services/project/project.modules");
const blog_modules_1 = require("./services/blog/blog.modules");
const client_module_1 = require("./services/client/client.module");
const team_module_1 = require("./services/team/team.module");
const testimonial_module_1 = require("./services/testtimonials/testimonial.module");
const contact_module_1 = require("./services/contact/contact.module");
const settingsModule_1 = require("./services/companyInfo/settingsModule");
const hero_modules_1 = require("./services/hero/hero.modules");
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
// 1. CORS first
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
// 2. Configure multer properly
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
app.use(upload.any()); // Accept any file uploads
// 3. Body parsing middleware for non-multipart requests
app.use(express_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "10mb", extended: true }));
// 4. UploadThing route
app.use("/api/uploadthing", (0, express_2.createRouteHandler)({
    router: uploadthing_1.uploadRouter,
    config: {
        isDev: true,
    },
}));
// 5. Auth routes (no files)
app.use("/api/auth", authRoutes_1.default);
app.use("/api", profileRoute_1.default);
// Mount modules
const servicesModule = new service_module_1.ServicesModule(prisma_1.default);
app.use("/api/services", servicesModule.getRoutes());
const slideShowModule = new slidwshow_modules_1.slideShowModules(prisma_1.default);
app.use("/api/slide-show", slideShowModule.getRoutes());
const projectModule = new project_modules_1.projectModules(prisma_1.default);
app.use("/api/projects", projectModule.getRoutes());
const blogModule = new blog_modules_1.blogModules(prisma_1.default);
app.use("/api/blogs", blogModule.getRoutes());
const clientModule = new client_module_1.ClientModule(prisma_1.default);
app.use("/api/clients", clientModule.getRoutes());
const teamModule = new team_module_1.TeamModule(prisma_1.default);
app.use("/api/team", teamModule.getRoutes());
const testimonialModule = new testimonial_module_1.TestimonialModule(prisma_1.default);
app.use("/api/testimonials", testimonialModule.getRoutes());
const contactModule = new contact_module_1.contactModule(prisma_1.default);
app.use("/api/contacts", contactModule.getRoutes());
const CompanyInfoModule = new settingsModule_1.CompanyInfoModule(prisma_1.default);
app.use("/api/company-info", CompanyInfoModule.getRoutes());
const HeroModule = new hero_modules_1.HeroModule(prisma_1.default);
app.use("/api/hero", HeroModule.getRoutes());
app.use(errorHandler_1.errorHandler);
// 7. Error handling middleware1
app.use((err, req, res, next) => {
    var _a;
    console.error("=== ERROR HANDLER ===");
    console.error("Error:", err.message);
    console.error("Code:", err.code);
    console.error("Stack:", err.stack);
    console.error("====================");
    if (err instanceof multer_1.default.MulterError) {
        console.error("Multer Error Details:", {
            code: err.code,
            field: err.field,
            message: err.message,
        });
        return res.status(400).json({
            error: "File upload error",
            message: err.message,
            code: err.code,
        });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            error: "Unexpected file field",
            message: "File field not expected or wrong field name",
        });
    }
    if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes("Unexpected end of form")) {
        return res.status(400).json({
            error: "Form parsing error",
            message: "The form data was incomplete or corrupted",
            suggestion: "Check your form data and try again",
        });
    }
    res.status(500).json({
        error: "Internal server error",
        message: err.message,
    });
});
exports.default = app;
