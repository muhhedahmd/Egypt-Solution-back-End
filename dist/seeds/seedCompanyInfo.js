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
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("../lib/helpers");
const prisma = new client_1.PrismaClient();
const PEXELS_API_KEY = process.env.PEXELS_API_KEY ||
    "QqHOijkJNcuseFqqxOV8EymJSj0ETWLZInSYybvXLWboILNNtFLgURUq";
function getRealImage(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, fallbackSize = "1200x800") {
        var _a;
        try {
            const response = yield axios_1.default.get("https://api.pexels.com/v1/search", {
                headers: {
                    Authorization: PEXELS_API_KEY,
                },
                params: {
                    query,
                    per_page: 1,
                    orientation: "landscape",
                },
            });
            const photo = (_a = response.data.photos) === null || _a === void 0 ? void 0 : _a[0];
            if (photo && photo.src && photo.src.large2x) {
                console.log(`  📸 Found Pexels image: "${photo.alt}" by ${photo.photographer}`);
                const imageResponse = yield axios_1.default.get(photo.src.large2x, {
                    responseType: "arraybuffer",
                });
                return Buffer.from(imageResponse.data);
            }
            console.log(`  ⚠️  Using placeholder for: ${query}`);
            const [width, height] = fallbackSize.split("x");
            const placeholderUrl = `https://placehold.co/${width}x${height}/4A90E2/FFFFFF/png?text=${encodeURIComponent(query.substring(0, 30))}`;
            const fallbackResponse = yield axios_1.default.get(placeholderUrl, {
                responseType: "arraybuffer",
            });
            return Buffer.from(fallbackResponse.data);
        }
        catch (error) {
            console.error(`Error getting image for "${query}":`, error.message);
            return null;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("🏢 Starting CompanyInfo seed...");
        // Clean existing company info
        console.log("🧹 Cleaning existing company info...");
        yield prisma.companyTranslation.deleteMany();
        yield prisma.companyInfo.deleteMany();
        // Get professional company image
        console.log("📸 Fetching professional company image...");
        const imageBuffer = yield getRealImage("modern corporate office building exterior tech", "1200x800");
        let dbImageId = null;
        if (imageBuffer) {
            const uploadedImage = yield (0, helpers_1.UploadImage)(imageBuffer, "Egypt Solutions HQ");
            if (uploadedImage && ((_a = uploadedImage.data) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const dbImage = yield (0, helpers_1.AssignImageToDBImage)({
                    imageType: "COMPANY_LOGO",
                    blurhash: uploadedImage.blurhash,
                    width: uploadedImage.width,
                    height: uploadedImage.height,
                    data: uploadedImage.data,
                });
                if (dbImage) {
                    dbImageId = dbImage.id;
                    console.log("✅ Image uploaded and assigned to DB.");
                }
            }
            else {
                console.log("⚠️ Failed to upload image to UploadThing.");
            }
        }
        console.log("🏛️ Creating Company Info record with English and Arabic translations...");
        yield prisma.companyInfo.create({
            data: {
                name: "Egypt Solutions", // Base name
                email: "contact@egypt-solutions.com",
                phone: "+20 100 123 4567",
                address: "123 Smart Village, Building B4",
                city: "Cairo",
                country: "Egypt",
                postalCode: "12577",
                facebook: "https://facebook.com/egyptsolutions",
                twitter: "https://twitter.com/egyptsolutions",
                linkedin: "https://linkedin.com/company/egyptsolutions",
                instagram: "https://instagram.com/egyptsolutions",
                github: "https://github.com/egyptsolutions",
                youtube: "https://youtube.com/egyptsolutions",
                logoId: dbImageId,
                companyTranslation: {
                    createMany: {
                        data: [
                            {
                                lang: "EN",
                                name: "Egypt Solutions",
                                tagline: "Empowering Your Digital Transformation",
                                description: "We are a leading software development agency in the MENA region, specializing in crafting scalable enterprise solutions, stunning web applications, and intuitive mobile experiences. Our mission is to bridge the gap between complex business needs and elegant technological execution.",
                                footerText: "© 2026 Egypt Solutions. All rights reserved.",
                                metaTitle: "Egypt Solutions | Premium Software Development Agency",
                                metaDescription: "Top-tier software development, web design, and mobile app creation agency based in Cairo, Egypt.",
                                metaKeywords: "software development, tech agency, web development, mobile apps, egypt tech, IT solutions",
                            },
                            {
                                lang: "AR",
                                name: "إيجيبت سوليوشنز",
                                tagline: "تمكين تحولك الرقمي",
                                description: "نحن وكالة رائدة في تطوير البرمجيات في منطقة الشرق الأوسط وشمال إفريقيا، متخصصون في صياغة حلول مؤسسية قابلة للتطوير، وتطبيقات ويب مذهلة، وتجارب مستخدم بديهية للهواتف المحمولة. مهمتنا هي سد الفجوة بين احتياجات العمل المعقدة والتنفيذ التكنولوجي الأنيق.",
                                footerText: "© 2026 إيجيبت سوليوشنز. جميع الحقوق محفوظة.",
                                metaTitle: "إيجيبت سوليوشنز | وكالة تطوير برمجيات متميزة",
                                metaDescription: "وكالة رائدة لتطوير البرمجيات وتصميم الويب وإنشاء تطبيقات الهاتف المحمول ومقرها القاهرة، مصر.",
                                metaKeywords: "تطوير برمجيات, وكالة تقنية, تطوير ويب, تطبيقات جوال, تقنية مصر, حلول تكنولوجيا المعلومات",
                            },
                        ],
                    },
                },
            },
        });
        console.log("✅ CompanyInfo seeded successfully!");
    });
}
main()
    .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
