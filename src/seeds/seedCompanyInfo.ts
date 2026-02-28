import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { UploadImage, AssignImageToDBImage } from "../lib/helpers";

const prisma = new PrismaClient();

const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY ||
  "QqHOijkJNcuseFqqxOV8EymJSj0ETWLZInSYybvXLWboILNNtFLgURUq";

async function getRealImage(
  query: string,
  fallbackSize = "1200x800",
): Promise<Buffer | null> {
  try {
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: 1,
        orientation: "landscape",
      },
    });

    const photo = response.data.photos?.[0];

    if (photo && photo.src && photo.src.large2x) {
      console.log(
        `  📸 Found Pexels image: "${photo.alt}" by ${photo.photographer}`,
      );
      const imageResponse = await axios.get(photo.src.large2x, {
        responseType: "arraybuffer",
      });
      return Buffer.from(imageResponse.data);
    }

    console.log(`  ⚠️  Using placeholder for: ${query}`);
    const [width, height] = fallbackSize.split("x");
    const placeholderUrl = `https://placehold.co/${width}x${height}/4A90E2/FFFFFF/png?text=${encodeURIComponent(query.substring(0, 30))}`;
    const fallbackResponse = await axios.get(placeholderUrl, {
      responseType: "arraybuffer",
    });
    return Buffer.from(fallbackResponse.data);
  } catch (error: any) {
    console.error(`Error getting image for "${query}":`, error.message);
    return null;
  }
}

async function main() {
  console.log("🏢 Starting CompanyInfo seed...");

  // Clean existing company info
  console.log("🧹 Cleaning existing company info...");
  await prisma.companyTranslation.deleteMany();
  await prisma.companyInfo.deleteMany();

  // Get professional company image
  console.log("📸 Fetching professional company image...");
  const imageBuffer = await getRealImage(
    "modern corporate office building exterior tech",
    "1200x800",
  );

  let dbImageId = null;

  if (imageBuffer) {
    const uploadedImage = await UploadImage(imageBuffer, "Egypt Solutions HQ");
    if (uploadedImage && uploadedImage.data?.length > 0) {
      const dbImage = await AssignImageToDBImage({
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
    } else {
      console.log("⚠️ Failed to upload image to UploadThing.");
    }
  }

  console.log(
    "🏛️ Creating Company Info record with English and Arabic translations...",
  );

  await prisma.companyInfo.create({
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
              description:
                "We are a leading software development agency in the MENA region, specializing in crafting scalable enterprise solutions, stunning web applications, and intuitive mobile experiences. Our mission is to bridge the gap between complex business needs and elegant technological execution.",
              footerText: "© 2026 Egypt Solutions. All rights reserved.",
              metaTitle:
                "Egypt Solutions | Premium Software Development Agency",
              metaDescription:
                "Top-tier software development, web design, and mobile app creation agency based in Cairo, Egypt.",
              metaKeywords:
                "software development, tech agency, web development, mobile apps, egypt tech, IT solutions",
            },
            {
              lang: "AR",
              name: "إيجيبت سوليوشنز",
              tagline: "تمكين تحولك الرقمي",
              description:
                "نحن وكالة رائدة في تطوير البرمجيات في منطقة الشرق الأوسط وشمال إفريقيا، متخصصون في صياغة حلول مؤسسية قابلة للتطوير، وتطبيقات ويب مذهلة، وتجارب مستخدم بديهية للهواتف المحمولة. مهمتنا هي سد الفجوة بين احتياجات العمل المعقدة والتنفيذ التكنولوجي الأنيق.",
              footerText: "© 2026 إيجيبت سوليوشنز. جميع الحقوق محفوظة.",
              metaTitle: "إيجيبت سوليوشنز | وكالة تطوير برمجيات متميزة",
              metaDescription:
                "وكالة رائدة لتطوير البرمجيات وتصميم الويب وإنشاء تطبيقات الهاتف المحمول ومقرها القاهرة، مصر.",
              metaKeywords:
                "تطوير برمجيات, وكالة تقنية, تطوير ويب, تطبيقات جوال, تقنية مصر, حلول تكنولوجيا المعلومات",
            },
          ],
        },
      },
    },
  });

  console.log("✅ CompanyInfo seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
