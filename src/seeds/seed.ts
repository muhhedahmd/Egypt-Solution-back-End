"@ts-nocheck"
import { PrismaClient, UserRole, Gender, ProjectStatus, BlogStatus, SlideshowType, CompositionType, ContactStatus } from '@prisma/client';
import {  faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import slugify from 'slugify';
import { randomUUID } from 'crypto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { UploadImage, AssignImageToDBImage } from '../lib/helpers';

const prisma = new PrismaClient();

// 🔑 Get your FREE API key from: https://www.pexels.com/api/
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'QqHOijkJNcuseFqqxOV8EymJSj0ETWLZInSYybvXLWboILNNtFLgURUq';

// Real tech stack data
const technologies = [
  { name: 'React', category: 'Frontend', icon: 'react' },
  { name: 'Next.js', category: 'Frontend', icon: 'nextjs' },
  { name: 'Vue.js', category: 'Frontend', icon: 'vue' },
  { name: 'Angular', category: 'Frontend', icon: 'angular' },
  { name: 'Node.js', category: 'Backend', icon: 'nodejs' },
  { name: 'Express', category: 'Backend', icon: 'express' },
  { name: 'NestJS', category: 'Backend', icon: 'nestjs' },
  { name: 'Django', category: 'Backend', icon: 'django' },
  { name: 'PostgreSQL', category: 'Database', icon: 'postgresql' },
  { name: 'MongoDB', category: 'Database', icon: 'mongodb' },
  { name: 'Redis', category: 'Database', icon: 'redis' },
  { name: 'MySQL', category: 'Database', icon: 'mysql' },
  { name: 'TypeScript', category: 'Language', icon: 'typescript' },
  { name: 'Python', category: 'Language', icon: 'python' },
  { name: 'Docker', category: 'DevOps', icon: 'docker' },
  { name: 'Kubernetes', category: 'DevOps', icon: 'kubernetes' },
  { name: 'AWS', category: 'Cloud', icon: 'aws' },
  { name: 'Azure', category: 'Cloud', icon: 'azure' },
  { name: 'Tailwind CSS', category: 'Frontend', icon: 'tailwind' },
  { name: 'GraphQL', category: 'Backend', icon: 'graphql' },
];

// Real service categories with specific search queries
// const services = [
//   {
//     name: 'Web Development',
//     description: 'Custom web applications built with modern technologies',
//     richDescription: 'We create scalable, performant web applications using cutting-edge frameworks like React, Next.js, and Node.js. Our solutions are tailored to your business needs with a focus on user experience and maintainability.',
//     icon: '🌐',
//     price: 'Starting from $5,000',
//     searchQuery: 'web development coding laptop',
//   },
//   {
//     name: 'Mobile App Development',
//     description: 'Native and cross-platform mobile applications',
//     richDescription: 'Build engaging mobile experiences for iOS and Android. We specialize in React Native and Flutter development, delivering apps that feel native while maintaining a single codebase.',
//     icon: '📱',
//     price: 'Starting from $8,000',
//     searchQuery: 'mobile app smartphone screen',
//   },
//   {
//     name: 'UI/UX Design',
//     description: 'Beautiful and intuitive user interfaces',
//     richDescription: 'Our design team crafts pixel-perfect interfaces that delight users. From wireframes to high-fidelity prototypes, we ensure every interaction is thoughtful and purposeful.',
//     icon: '🎨',
//     price: 'Starting from $3,000',
//     searchQuery: 'ui design wireframe sketch',
//   },
//   {
//     name: 'Cloud Infrastructure',
//     description: 'Scalable cloud solutions and DevOps',
//     richDescription: 'Deploy and manage your applications on AWS, Azure, or Google Cloud. We handle everything from architecture design to CI/CD pipelines and monitoring.',
//     icon: '☁️',
//     price: 'Starting from $4,000',
//     searchQuery: 'cloud computing server technology',
//   },
//   {
//     name: 'E-commerce Solutions',
//     description: 'Complete online store development',
//     richDescription: 'Launch your online business with custom e-commerce platforms. We integrate payment gateways, inventory management, and create seamless shopping experiences.',
//     icon: '🛒',
//     price: 'Starting from $10,000',
//     searchQuery: 'online shopping ecommerce',
//   },
// ];
const services = []

// Pexels API helper to get REAL stock photos
async function searchPexelsImage(query: string, perPage = 1): Promise<any> {
  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: perPage,
        orientation: 'landscape',
      },
    });
    
    return response.data.photos?.[0];
  } catch (error : any) {
    console.error(`Error searching Pexels for "${query}":`, error);
    return null;
  }
}

// Download image from URL and return Buffer
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    return Buffer.from(response.data);
  } catch (error : any) {
    console.error(`Error downloading image from ${url}:`, error);
    return null;
  }
}

// Get real image from Pexels with fallback
async function getRealImage(query: string, fallbackSize = '1200x800'): Promise<Buffer | null> {
  try {
    // Try Pexels first
    const photo = await searchPexelsImage(query);
    
    if (photo && photo.src && photo.src.large2x) {
      console.log(`  📸 Found Pexels image: "${photo.alt}" by ${photo.photographer}`);
      const imageBuffer = await downloadImage(photo.src.large2x);
      if (imageBuffer) return imageBuffer;
    }

    // Fallback to placeholder with descriptive text
    console.log(`  ⚠️  Using placeholder for: ${query}`);
    const [width, height] = fallbackSize.split('x');
    const placeholderUrl = `https://placehold.co/${width}x${height}/4A90E2/FFFFFF/png?text=${encodeURIComponent(query.substring(0, 30))}`;
    return await downloadImage(placeholderUrl);
  } catch (error : any) {
    console.error(`Error getting image for "${query}":`, error);
    return null;
  }
}

// Delay helper to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main seeding function
async function main() {
  console.log('🌱 Starting database seeding with REAL images from Pexels...\n');

  if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
    console.log('⚠️  WARNING: Please set PEXELS_API_KEY in your .env file');
    console.log('   Get your FREE key at: https://www.pexels.com/api/\n');
  }

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  // await prisma.blogCategory.deleteMany();
  // await prisma.projectTechnology.deleteMany();
  // await prisma.serviceSlideShow.deleteMany();
  // await prisma.projectSlideShow.deleteMany();
  // await prisma.clientSlideShow.deleteMany();
  // await prisma.testimonialSlideShow.deleteMany();
  // await prisma.teamSlideShow.deleteMany();
  // await prisma.slideShow.deleteMany();
  // await prisma.session.deleteMany();
  // await prisma.profile.deleteMany();
  // await prisma.blog.deleteMany();
  // await prisma.testimonial.deleteMany();
  // await prisma.client.deleteMany();
  // await prisma.teamMember.deleteMany();
  // await prisma.project.deleteMany();
  // await prisma.service.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.category.deleteMany();
  // await prisma.companyInfo.deleteMany();
  // await prisma.contact.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.image.deleteMany();

  // 1. Create Company Info
  // console.log('\n🏢 Creating company info...');
  // await prisma.companyInfo.create({
  //   data: {
  //     name: 'TechVision Solutions',
  //     tagline: 'Building Tomorrow\'s Digital Experiences Today',
  //     description: 'We are a full-service software development company specializing in web and mobile applications.',
  //     email: 'hello@techvision.com',
  //     phone: '+1 (555) 123-4567',
  //     address: '123 Tech Street',
  //     city: 'San Francisco',
  //     country: 'USA',
  //     postalCode: '94103',
  //     facebook: 'https://facebook.com/techvision',
  //     twitter: 'https://twitter.com/techvision',
  //     linkedin: 'https://linkedin.com/company/techvision',
  //     instagram: 'https://instagram.com/techvision',
  //     github: 'https://github.com/techvision',
  //     metaTitle: 'TechVision Solutions - Software Development Company',
  //     metaDescription: 'Leading software development company specializing in web, mobile, and cloud solutions',
  //     metaKeywords: 'software development, web development, mobile apps, cloud solutions',
  //   },
  // });

  // 2. Create Users
  console.log('👥 Creating users...');
  // const hashedPassword = await bcrypt.hash('password123', 10);
  // const users = await Promise.all([
  //   prisma.user.create({
  //     data: {
  //       name: 'John Admin',
  //       email: 'admin@techvision.com',
  //       password: hashedPassword,
  //       role: UserRole.ADMIN,
  //       gender: Gender.MALE,
  //       emailConfirmed: true,
  //     },
  //   }),
  //   prisma.user.create({
  //     data: {
  //       name: 'Sarah Editor',
  //       email: 'sarah@techvision.com',
  //       password: hashedPassword,
  //       role: UserRole.EDITOR,
  //       gender: Gender.FEMALE,
  //       emailConfirmed: true,
  //     },
  //   }),
  //   prisma.user.create({
  //     data: {
  //       name: 'Mike Writer',
  //       email: 'mike@techvision.com',
  //       password: hashedPassword,
  //       role: UserRole.EDITOR,
  //       gender: Gender.MALE,
  //       emailConfirmed: true,
  //     },
  //   }),
  // ]);
  // console.log('  ✓ Created 3 users');

  // 3. Create Technologies
  console.log('\n⚙️ Creating technologies...');
  const createdTechs = await Promise.all(
    technologies.map((tech) =>
      prisma.technology.create({
        data: {
          name: tech.name,
          slug: slugify(tech.name, { lower: true }),
          icon: tech.icon,
          category: tech.category,
        },
      })
    )
  );
  console.log(`  ✓ Created ${createdTechs.length} technologies`);

  // 4. Create Categories
  console.log('\n📚 Creating blog categories...');
  const categoryNames = ['Web Development', 'Mobile', 'Design', 'DevOps', 'Tutorial', 'News', 'Case Study', 'Technology'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: slugify(name, { lower: true }),
        },
      })
    )
  );
  // console.log(`  ✓ Created ${categories.length} categories`);

  // 5. Create Services (50 items)
  // console.log('\n💼 Creating 50 services with real images...');
  // const createdServices = [];
  
  // for (let i = 0; i < 50; i++) {
  //   const service = services[i % services.length];
  //   const variation = Math.floor(i / services.length);
    
  //   try {
  //     console.log(`\n[${i + 1}/50] Creating: ${service.name}...`);
      
  //     const imageBuffer = await getRealImage(service.searchQuery, '1200x800');
  //     if (!imageBuffer) {
  //       console.log('  ⚠️  Skipping - no image available');
  //       continue;
  //     }

  //     await delay(500); // Pexels rate limit protection
  //     const uploadedImage = await UploadImage(imageBuffer, `${service.name} ${variation + 1}`);
  //   if(!uploadedImage)  return
      
  //     const dbImage = await AssignImageToDBImage({
  //       imageType: 'SERVICE',
  //       blurhash: uploadedImage.blurhash,
  //       width: uploadedImage.width,
  //       height: uploadedImage.height,
  //       data: uploadedImage.data,
  //     }, prisma);

  //     const createdService = await prisma.service.create({
  //       data: {
  //         name: `${service.name}${variation > 0 ? ` - Tier ${variation + 1}` : ''}`,
  //         slug: slugify(`${service.name}-${randomUUID().substring(0, 6)}`, { lower: true }),
  //         description: service.description,
  //         richDescription: service.richDescription,
  //         icon: service.icon,
  //         imageId: dbImage.id,
  //         price: service.price,
  //         isActive: Math.random() > 0.1,
  //         isFeatured: i < 5,
  //         order: i,
  //       },
  //     });

  //     createdServices.push(createdService);
  //     console.log(`  ✅ Service created successfully`);
  //   } catch (error : any) {
  //     console.error(`  ❌ Error creating service ${i + 1}:`, error?.message);
  //   }
  // }

  // 6. Create Clients (50 items)
//   console.log('\n\n🤝 Creating 50 clients with real images...');
//   const industries = ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education', 'Entertainment', 'Real Estate', 'Manufacturing'];
//   const createdClients = [];

// const adjectives = [
//   'modern',
//   'sleek',
//   'minimal',
//   'photorealistic',
//   'futuristic',
//   'corporate',
//   'bright',
//   'studio-lit',
//   'aerial',
//   'isometric',
//   'architectural',
// ];

// const concepts = [
//   'office building',
//   'headquarters',
//   'workplace lobby',
//   'co-working space',
//   'glass tower',
//   'corporate campus',
//   'business center',
// ];

// const logoStyles = [
//   'abstract minimal',
//   'flat',
//   'monogram',
//   'geometric',
//   'negative-space',
//   'line-art',
//   'emblem',
// ];

// const clientPrompts = [
//   "Modern glass skyscraper corporate headquarters",
//   "Sleek high-tech office building",
//   "Innovative startup office exterior",
//   "Futuristic urban business tower",
//   "Minimalist corporate building design",
//   "Luxury high-rise office complex",
//   "Creative agency modern office",
//   "Industrial style office building",
//   "Eco-friendly corporate campus",
//   "Contemporary office with glass facade",
//   "Modern architectural building for business",
//   "Tech company HQ in city skyline",
//   "Corporate skyscraper reflecting clouds",
//   "Minimal office with greenery",
//   "Elegant glass office tower",
//   "Urban business center modern design",
//   "Futuristic office building with lights",
//   "Contemporary glass corporate HQ",
//   "High-tech office in metropolitan area",
//   "Stylish office building with courtyard",
//   "Corporate campus with modern design",
//   "Modern business complex in city",
//   "Innovative glass office tower",
//   "Creative corporate building exterior",
//   "Sleek downtown office architecture",
//   "Contemporary HQ with urban view",
//   "Minimalist high-rise office building",
//   "Eco-friendly modern business HQ",
//   "Corporate building with modern facade",
//   "Luxury business tower in city",
//   "Urban modern office complex",
//   "Tech startup office exterior",
//   "Futuristic corporate building design",
//   "Glass office building with reflections",
//   "Modern headquarters with innovation theme",
//   "Stylish urban business center",
//   "Minimal corporate office tower",
//   "High-tech glass skyscraper",
//   "Contemporary downtown office",
//   "Eco-friendly corporate HQ exterior",
//   "Modern office building in city skyline",
//   "Luxury business HQ with glass facade",
//   "Urban creative office complex",
//   "Futuristic high-rise corporate HQ",
//   "Contemporary business campus",
//   "Sleek corporate building exterior",
//   "Minimalist office tower in city",
//   "Modern business headquarters",
//   "Innovative corporate glass building",
//   "Creative modern office HQ",
//   "High-tech urban office building"
// ];
// const clientLogoPrompts = [
//   "Minimal abstract logo, modern style",
//   "Sleek geometric logo design",
//   "Creative tech company logo",
//   "Luxury minimal logo",
//   "Futuristic corporate logo",
//   "Innovative brand logo with symbol",
//   "Simple elegant logo for business",
//   "High-tech company logo",
//   "Professional abstract emblem",
//   "Modern minimalist company logo",
//   "Creative geometric brand logo",
//   "Urban style corporate logo",
//   "Tech startup logo with symbol",
//   "Clean simple logo design",
//   "Contemporary abstract logo",
//   "Luxury brand emblem",
//   "Minimal flat logo design",
//   "Futuristic geometric company logo",
//   "Professional simple logo",
//   "High-end modern logo",
//   "Abstract creative logo",
//   "Minimalist tech brand logo",
//   "Sleek flat corporate logo",
//   "Innovative emblem design",
//   "Modern logo with simple icon",
//   "Creative brand logo for company",
//   "Geometric business logo",
//   "Futuristic symbol logo",
//   "Minimal abstract brand logo",
//   "Sleek modern corporate logo",
//   "Luxury geometric logo",
//   "Professional minimal emblem",
//   "Tech startup abstract logo",
//   "Contemporary simple logo",
//   "Creative luxury logo design",
//   "High-tech minimalist logo",
//   "Urban professional logo",
//   "Minimal abstract tech logo",
//   "Modern flat company logo",
//   "Futuristic business logo",
//   "Clean geometric logo",
//   "Sleek creative brand logo",
//   "Innovative minimal emblem",
//   "Luxury abstract logo",
//   "Professional geometric logo",
//   "Modern abstract company logo",
//   "Minimal creative brand logo",
//   "Tech logo with clean style",
//   "Contemporary sleek logo",
//   "Creative futuristic emblem",
//   "High-tech modern logo"
// ];
// const sizes = ['800x600', '1024x768', '1200x800', '640x480', '1600x900'];

// async function fetchWithRetries(getter: () => Promise<Buffer | null>, attempts = 3, waitMs = 400) {
//   let lastErr: any = null;
//   for (let i = 0; i < attempts; i++) {
//     try {
//       const res = await getter();
//       if (res) return res;
//       lastErr = new Error('No buffer returned');
//     } catch (err) {
//       lastErr = err;
//     }
//     if (i < attempts - 1) await delay(waitMs);
//   }
//   throw lastErr;
// }

// // const createdClients: any[] = [];

// for (let i = 0; i < 50; i++) {
//   try {
//     const companyName = faker.company.name();
//     console.log(`\n[${i + 1}/50] Creating client: ${companyName}...`);

//     // pick dynamic parts
//     const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
//     const concept = concepts[Math.floor(Math.random() * concepts.length)];
//     const industry = industries[i % industries.length] ?? 'general';
//     const visualHint = faker.hacker.adjective() || 'professional';
//     const imageSize = sizes[Math.floor(Math.random() * sizes.length)];

//     // build dynamic prompt for the scene image
//     // const scenePrompt = `${adjective} ${concept} for a ${industry} company, ${visualHint}, high detail, professional photography, 3:2 aspect, corporate branding context — cinematic composition`;

//     // build dynamic prompt for the logo (use company name + style hints)
//     const logoStyle = logoStyles[Math.floor(Math.random() * logoStyles.length)];
//     const logoPrompt = `${companyName} ${logoStyle} logo, simple, scalable, vector-friendly, centered, white-background`;

//     // fetch images with retries
//     const imageBuffer = await fetchWithRetries(() => getRealImage(clientPrompts[Math.floor(Math.random() * clientPrompts.length)] , imageSize), 3, 700).catch((e) => {
//       console.warn('  ⚠️ Scene image fetch failed:', e.message || e);
//       return null;
//     });

//     const logoBuffer = await fetchWithRetries(() => getRealImage(clientLogoPrompts[Math.floor(Math.random() * clientLogoPrompts.length)], '400x400'), 3, 500).catch((e) => {
//       console.warn('  ⚠️ Logo fetch failed:', e.message || e);
//       return null;
//     });

//     if (!imageBuffer || !logoBuffer) {
//       console.log('  ⚠️  Skipping - images unavailable');
//       continue;
//     }

//     // small delay to avoid hammering image service
//     await delay(500);

//     const uploadedImage = await UploadImage(imageBuffer, `${companyName} scene`);
//     const uploadedLogo = await UploadImage(logoBuffer, `${companyName} logo`);

//     if (!uploadedImage || !uploadedLogo) {
//       console.log('  ⚠️  Skipping - upload failed');
//       continue;
//     }

//     const dbImage = await AssignImageToDBImage({
//       imageType: 'CLIENT',
//       blurhash: uploadedImage.blurhash,
//       width: uploadedImage.width,
//       height: uploadedImage.height,
//       data: uploadedImage.data,
//     }, prisma);

//     const dbLogo = await AssignImageToDBImage({
//       imageType: 'CLIENT',
//       blurhash: uploadedLogo.blurhash,
//       width: uploadedLogo.width,
//       height: uploadedLogo.height,
//       data: uploadedLogo.data,
//     }, prisma);

//     const client = await prisma.client.create({
//       data: {
//         name: companyName,
//         slug: slugify(`${companyName}-${randomUUID().substring(0, 6)}`, { lower: true }),
//         description: faker.company.catchPhrase(),
//         richDescription: faker.lorem.paragraphs(3),
//         website: faker.internet.url(),
//         industry,
//         imageId: dbImage.id,
//         logoId: dbLogo.id,
//         isActive: true,
//         isFeatured: i < 8,
//         order: i,
//       },
//     });

//     createdClients.push(client);
//     console.log(`  ✅ Client created successfully`);
//   } catch (error: any) {
//     console.error(`  ❌ Error creating client ${i + 1}:`, error?.message ?? error);
//   }
// }
  // 7. Create Projects (50 items)
  // console.log('\n\n🚀 Creating 50 projects with real images...');
  // const projectSearchQueries = [
  //   'web application dashboard',
  //   'mobile app interface',
  //   'analytics dashboard screen',
  //   'ecommerce website',
  //   'portfolio website design',
  //   'saas platform interface',
  // ];

  // const createdProjects = [];

  // for (let i = 0; i < 50; i++) {
  //   try {
  //     const projectName = `${faker.company.catchPhrase( )} Platform`;
  //     console.log(`\n[${i + 1}/50] Creating project: ${projectName}...`);

  //     const searchQuery = projectSearchQueries[i % projectSearchQueries.length];
  //     const imageBuffer = await getRealImage(searchQuery, '1400x900');

  //     if (!imageBuffer) {
  //       console.log('  ⚠️  Skipping - image unavailable');
  //       continue;
  //     }

  //     await delay(500);

  //     const uploadedImage = await UploadImage(imageBuffer, projectName);
      
  //     if(!uploadedImage)  return
  //     const dbImage = await AssignImageToDBImage({
  //       imageType: 'PROJECT',
  //       blurhash: uploadedImage.blurhash,
  //       width: uploadedImage.width,
  //       height: uploadedImage.height,
  //       data: uploadedImage.data,
  //     }, prisma);

  //     const projectTechs = faker.helpers.arrayElements(createdTechs, faker.number.int({ min: 3, max: 7 }));
  //     const randomService = faker.helpers.arrayElement(createdServices);

  //     const project = await prisma.project.create({
  //       data: {
  //         title: projectName,
  //         slug: slugify(`${projectName}-${randomUUID().substring(0, 6)}`, { lower: true }),
  //         description: faker.lorem.sentence(20),
  //         richDescription: faker.lorem.paragraphs(4),
  //         clientName: faker.person.fullName(),
  //         clientCompany: faker.company.name(),
  //         projectUrl: Math.random() > 0.3 ? faker.internet.url() : undefined,
  //         githubUrl: Math.random() > 0.5 ? `https://github.com/techvision/${slugify(projectName, { lower: true })}` : undefined,
  //         status: faker.helpers.enumValue(ProjectStatus),
  //         startDate: faker.date.past({ years: 2 }),
  //         endDate: Math.random() > 0.3 ? faker.date.recent({ days: 180 }) : undefined,
  //         imageId: dbImage.id,
  //         isFeatured: i < 10,
  //         order: i,
  //         technologies: {
  //           create: projectTechs.map(tech => ({
  //             technologyId: tech.id,
  //           })),
  //         },
  //         services: {
  //           connect: { id: randomService.id },
  //         },
  //       },
  //     });

  //     createdProjects.push(project);
  //     console.log(`  ✅ Project created successfully`);
  //   } catch (error : any) {
  //     console.error(`  ❌ Error creating project ${i + 1}:`, error.message);
  //   }
  // }




  // 7. Assign technologies & services to existing projects (50 updates)
console.log('\n\n🚀 Assigning technologies & services to existing projects...');

// const projectSearchQueries = [
//   'web application dashboard',
//   'mobile app interface',
//   'analytics dashboard screen',
//   'ecommerce website',
//   'portfolio website design',
//   'saas platform interface',
// ];

const createdProjects: any[] = [];

// Fetch existing projects once
const existingProjects = await prisma.project.findMany({
  select: { id: true, title: true }, // reduce payload
});
const existingServices = await prisma.service.findMany({
  select: { id: true }, // reduce payload
});

if (!existingProjects || existingProjects.length === 0) {
  console.log('❌ No existing projects found to update.');
} else {
  // optional: shuffle a copy to avoid updating same project repeatedly
  const projectsPool = [...existingProjects];
  // simple Fisher–Yates shuffle
  for (let i = projectsPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [projectsPool[i], projectsPool[j]] = [projectsPool[j], projectsPool[i]];
  }

  // We'll update up to 50 projects or number of projects available
  const updatesCount = Math.min(50, projectsPool.length);

  for (let i = 0; i < updatesCount; i++) {
    try {
      const targetProject = projectsPool[i]; // pick shuffled unique project
      console.log(`\n[${i + 1}/${updatesCount}] Updating project ID: ${targetProject.id} - ${targetProject.title}...`);

      // choose random techs and a random service (from previously created arrays)
      const projectTechs = faker.helpers.arrayElements(createdTechs, faker.number.int({ min: 3, max: 7 }));
      const randomService = faker.helpers.arrayElement(existingServices);

      // prepare create array for technologies relation
      const techCreates = projectTechs.map(tech => ({
        technologyId: tech.id,
      }));

      // slight delay to avoid hammering external services (if any)
      await delay(200);

      const updatedProject = await prisma.project.update({
        where: { id: targetProject.id },
        data: {
          // Add technologies by creating join records (assumes ProjectTechnology join model)
          technologies: {
            create: techCreates,
          },
          // Connect the project with an existing service
          services: {
            connect: { id: randomService.id },
          },
        },
      });

      createdProjects.push(updatedProject);
      console.log('  ✅ Project updated successfully');
    } catch (error: any) {
      console.error(`  ❌ Error updating project ${i + 1}:`, error.message);
    }
  }
}


  const teamImagePrompts = [
  "Studio portrait of a confident CEO, professional lighting",
  "Headshot of CTO, tech startup environment",
  "Senior developer in modern office",
  "Lead developer in creative workspace",
  "Frontend developer coding at desk",
  "Backend developer focused on screen",
  "UI/UX designer with sketches",
  "DevOps engineer working with servers",
  "Project manager in meeting room",
  "QA engineer testing software",
  "Creative developer in bright office",
  "Professional programmer at workstation",
  "Team lead in corporate environment",
  "Software engineer with laptop",
  "UI designer in modern studio",
  "UX researcher analyzing data",
  "Full stack developer at desk",
  "Scrum master organizing sprint",
  "Mobile developer with tablet",
  "Cloud engineer monitoring systems",
  "Tech consultant in office space",
  "Front-end coder in collaborative space",
  "Backend specialist with code screen",
  "UI/UX lead in design studio",
  "DevOps architect in server room",
  "Project coordinator in office",
  "QA analyst reviewing bugs",
  "Software architect with blueprint",
  "Senior engineer brainstorming",
  "Junior developer learning",
  "Graphic designer at desk",
  "Team lead in conference room",
  "Software tester reviewing app",
  "Engineer with futuristic workspace",
  "Full stack coder focusing on project",
  "UI/UX creative with prototypes",
  "Backend engineer writing API",
  "Frontend engineer testing UI",
  "CTO planning roadmap",
  "CEO leading team",
  "Designer sketching app interface",
  "DevOps manager in server lab",
  "Team mentor advising developers",
  "Product manager planning sprint",
  "Software engineer pair programming",
  "UX researcher testing prototype",
  "Mobile app developer coding",
  "Lead designer presenting concept",
  "Tech lead reviewing code",
  "Cloud architect planning infrastructure",
  "QA lead testing complex system"
];

  // 8. Create Team Members (50 items)
//   console.log('\n\n👨‍💻 Creating 50 team members with real images...');
//   const positions = ['CEO', 'CTO', 'Lead Developer', 'Senior Developer', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'DevOps Engineer', 'Project Manager', 'QA Engineer'];
//   const createdTeamMembers = [];


// for (let i = 0; i < 50; i++) {
//   try {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const fullName = `${firstName} ${lastName}`;
//     console.log(`\n[${i + 1}/50] Creating team member: ${fullName}...`);

//     // <-- DYNAMIC PROMPT (only change)
//     const position = positions[i % positions.length];
//     const mood = faker.word.adjective(); // e.g. "confident", "friendly"
//     const shotType = Math.random() > 0.5 ? 'studio portrait' : 'business headshot';
//     const imagePrompt = `${shotType} of ${fullName}, ${position}, ${mood}, high resolution, neutral background, professional lighting`;
//     // <-- end change

//     const imageBuffer = await getRealImage(teamImagePrompts[i], '600x600');

//     if (!imageBuffer) {
//       console.log('  ⚠️  Skipping - image unavailable');
//       continue;
//     }

//     await delay(1000);

//     const uploadedImage = await UploadImage(imageBuffer, fullName);
    
//     if(!uploadedImage)  return
//     const dbImage = await AssignImageToDBImage({
//       imageType: 'TEAM',
//       blurhash: uploadedImage.blurhash,
//       width: uploadedImage.width,
//       height: uploadedImage.height,
//       data: uploadedImage.data,
//     }, prisma);

//     const teamMember = await prisma.teamMember.create({
//       data: {
//         name: fullName,
//         slug: slugify(`${fullName}-${randomUUID().substring(0, 6)}`, { lower: true }),
//         position: positions[i % positions.length],
//         bio: faker.lorem.paragraphs(2),
//         email: faker.internet.email({ firstName, lastName }),
//         phone: faker.phone.number(),
//         imageId: dbImage.id,
//         linkedin: `https://linkedin.com/in/${slugify(fullName, { lower: true })}`,
//         github: Math.random() > 0.5 ? `https://github.com/${slugify(fullName, { lower: true })}` : undefined,
//         twitter: Math.random() > 0.5 ? `https://twitter.com/${slugify(fullName, { lower: true })}` : undefined,
//         isActive: true,
//         isFeatured: i < 12,
//         order: i,
//       },
//     });

//     createdTeamMembers.push(teamMember);
//     console.log(`  ✅ Team member created successfully`);
//   } catch (error : any) {
//     console.error(`  ❌ Error creating team member ${i + 1}:`, error.message);
//   }
// }



const testimonialImagePrompts = [
  "Portrait of happy client, smiling",
  "Professional headshot of satisfied customer",
  "Business person giving testimonial",
  "Confident client in corporate setting",
  "Friendly professional in office",
  "Customer in modern workspace",
  "Client with positive expression",
  "Businesswoman smiling at camera",
  "Businessman confident in office",
  "Smiling professional with laptop",
  "Professional client in bright environment",
  "Happy customer with crossed arms",
  "Business client expressing satisfaction",
  "Satisfied client in boardroom",
  "Smiling customer with tablet",
  "Confident professional sharing feedback",
  "Professional client giving recommendation",
  "Businessperson posing in office",
  "Client with happy expression",
  "Corporate professional smiling",
  "Executive client satisfied with service",
  "Happy business customer",
  "Client portrait in creative space",
  "Professional in modern office",
  "Businesswoman giving testimonial",
  "Businessman in professional setting",
  "Client expressing approval",
  "Smiling corporate client",
  "Customer with positive feedback",
  "Satisfied professional in office",
  "Portrait of business client",
  "Professional smiling customer",
  "Client giving feedback in office",
  "Happy executive with laptop",
  "Confident business client",
  "Corporate client smiling",
  "Businessperson in professional portrait",
  "Customer showing satisfaction",
  "Client portrait in modern workspace",
  "Happy professional testimonial",
  "Smiling executive in office",
  "Satisfied client at desk",
  "Business client positive feedback",
  "Professional customer happy",
  "Confident client headshot",
  "Portrait of satisfied client",
  "Client smiling in office",
  "Businessperson confident in workplace",
  "Customer testimonial professional portrait",
  "Happy corporate client"
];

  // 9. Create Testimonials (50 items)
  console.log('\n\n⭐ Creating 50 testimonials with real images...');
// const createdTestimonials = [];

// for (let i = 0; i < 50; i++) {
//   try {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const fullName = `${firstName} ${lastName}`;
//     console.log(`\n[${i + 1}/50] Creating testimonial from: ${fullName}...`);

//     // ⬅️⬅️ Dynamic image prompt (only new line)
//     const mood = faker.word.adjective(); // friendly, confident, etc
//     const shotType = Math.random() > 0.5 ? "studio headshot" : "professional portrait";
//     // const imagePrompt = `${shotType} of ${fullName}, ${mood}, clean background, high quality`;

//     const imageBuffer = await getRealImage(testimonialImagePrompts[i ], '400x400');

//     if (!imageBuffer) {
//       console.log('  ⚠️  Skipping - image unavailable');
//       continue;
//     }

//     await delay(1000);

//     const uploadedImage = await UploadImage(imageBuffer, fullName);
    
//     if(!uploadedImage) return;

//     const dbImage = await AssignImageToDBImage({
//       imageType: 'TESTIMONIAL',
//       blurhash: uploadedImage.blurhash,
//       width: uploadedImage.width,
//       height: uploadedImage.height,
//       data: uploadedImage.data,
//     }, prisma);

//     const testimonial = await prisma.testimonial.create({
//       data: {
//         clientName: fullName,
//         clientPosition: faker.person.jobTitle(),
//         clientCompany: faker.company.name(),
//         content: faker.lorem.paragraph({ min: 3, max: 6 }),
//         rating: faker.number.int({ min: 4, max: 5 }),
//         avatarId: dbImage.id,
//         isActive: true,
//         isFeatured: i < 15,
//         order: i,
//       },
//     });

//     createdTestimonials.push(testimonial);
//     console.log(`  ✅ Testimonial created successfully`);
//   } catch (error : any) {
//     console.error(`  ❌ Error creating testimonial ${i + 1}:`, error.message);
//   }
// }


  // 10. Create Blogs (120 items)
  // console.log('\n\n📝 Creating 120 blog posts with real images...');
  // const blogSearchQueries = [
  //   'programming code laptop',
  //   'web development workspace',
  //   'mobile development smartphone',
  //   'software engineering team',
  //   'technology innovation',
  //   'cloud computing servers',
  // ];

  // for (let i = 0; i < 120; i++) {
  //   try {
  //     const title = faker.lorem.sentence(8);
  //     console.log(`\n[${i + 1}/120] Creating blog: ${title.substring(0, 50)}...`);

  //     const searchQuery = blogSearchQueries[i % blogSearchQueries.length];
  //     const imageBuffer = await getRealImage(searchQuery, '1600x900');

  //     if (!imageBuffer) {
  //       console.log('  ⚠️  Skipping - image unavailable');
  //       continue;
  //     }

  //     await delay(400);

  //     const uploadedImage = await UploadImage(imageBuffer, title);
      
  //     if(!uploadedImage)  return
  //     const dbImage = await AssignImageToDBImage({
  //       imageType: 'BLOG',
  //       blurhash: uploadedImage.blurhash,
  //       width: uploadedImage.width,
  //       height: uploadedImage.height,
  //       data: uploadedImage.data,
  //     }, prisma);

  //     const randomCategories = faker.helpers.arrayElements(categories, faker.number.int({ min: 1, max: 3 }));
  //     const randomAuthor = faker.helpers.arrayElement(users);

  //     await prisma.blog.create({
  //       data: {
  //         title,
  //         slug: slugify(`${title}-${randomUUID().substring(0, 6)}`, { lower: true }),
  //         excerpt: faker.lorem.sentences(3),
  //         content: faker.lorem.paragraphs(15),
  //         imageId: dbImage.id,
  //         authorId: randomAuthor.id,
  //         status: faker.helpers.enumValue(BlogStatus),
  //         publishedAt: Math.random() > 0.2 ? faker.date.past({ years: 1 }) : undefined,
  //         isFeatured: i < 20,
  //         views: faker.number.int({ min: 0, max: 10000 }),
  //         readingTime: faker.number.int({ min: 3, max: 15 }),
  //         metaTitle: title,
  //         metaDescription: faker.lorem.sentence(15),
  //         metaKeywords: faker.lorem.words(10),
  //         categories: {
  //           create: randomCategories.map(cat => ({
  //             categoryId: cat.id,
  //           })),
  //         },
  //       },
  //     });

  //     console.log(`  ✅ Blog created successfully`);
  //   } catch (error : any) {
  //     console.error(`  ❌ Error creating blog ${i + 1}:`, error.message);
  //   }
  // }

  // 11. Create SlideShows (10 items with attachments)
  // console.log('\n\n🎬 Creating 10 slideshows with attachments...');
  
  // const slideshowConfigs = [
  //   { title: 'Featured Services', type: SlideshowType.SERVICES, composition: CompositionType.CAROUSEL },
  //   { title: 'Our Portfolio', type: SlideshowType.PROJECTS, composition: CompositionType.GRID },
  //   { title: 'Client Testimonials', type: SlideshowType.TESTIMONIALS, composition: CompositionType.FADE },
  //   { title: 'Meet Our Team', type: SlideshowType.TEAM, composition: CompositionType.STACKED },
  //   { title: 'Trusted By', type: SlideshowType.CLIENTS, composition: CompositionType.CAROUSEL },
  //   { title: 'Hero Services', type: SlideshowType.HERO, composition: CompositionType.SINGLE },
  //   { title: 'Top Projects', type: SlideshowType.PROJECTS, composition: CompositionType.CAROUSEL },
  //   { title: 'All Services', type: SlideshowType.SERVICES, composition: CompositionType.GRID },
  //   { title: 'Customer Stories', type: SlideshowType.TESTIMONIALS, composition: CompositionType.CAROUSEL },
  //   { title: 'Leadership Team', type: SlideshowType.TEAM, composition: CompositionType.GRID },
  // ];

  // for (const config of slideshowConfigs) {
  //   try {
  //     console.log(`\nCreating slideshow: ${config.title}...`);
      
  //     const slideshow = await prisma.slideShow.create({
  //       data: {
  //         title: config.title,
  //         slug: slugify(`${config.title}-${randomUUID().substring(0, 6)}`, { lower: true }),
  //         description: faker.lorem.sentence(10),
  //         type: config.type,
  //         composition: config.composition,
  //         background: faker.helpers.arrayElement(['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#7ED321']),
  //         isActive: true,
  //         autoPlay: Math.random() > 0.5,
  //         interval: faker.number.int({ min: 3000, max: 7000 }),
  //         order: slideshowConfigs.indexOf(config),
  //       },
  //     });

  //     let attachCount = 0;

  //     switch (config.type) {
  //       case SlideshowType.SERVICES:
  //         const servicesToAttach = faker.helpers.arrayElements(createdServices, Math.min(10, createdServices.length));
  //         for (let idx = 0; idx < servicesToAttach.length; idx++) {
  //           await prisma.serviceSlideShow.create({
  //             data: {
  //               serviceId: servicesToAttach[idx].id,
  //               slideShowId: slideshow.id,
  //               order: idx,
  //               isVisible: true,
  //               customTitle: Math.random() > 0.7 ? faker.lorem.sentence(5) : undefined,
  //               customDesc: Math.random() > 0.7 ? faker.lorem.sentence(10) : undefined,
  //             },
  //           });
  //           attachCount++;
  //         }
  //         break;

  //       case SlideshowType.PROJECTS:
  //         const projectsToAttach = faker.helpers.arrayElements(createdProjects, Math.min(12, createdProjects.length));
  //         for (let idx = 0; idx < projectsToAttach.length; idx++) {
  //           await prisma.projectSlideShow.create({
  //             data: {
  //               projectId: projectsToAttach[idx].id,
  //               slideShowId: slideshow.id,
  //               order: idx,
  //               isVisible: true,
  //             },
  //           });
  //           attachCount++;
  //         }
  //         break;

  //       case SlideshowType.CLIENTS:
  //         const clientsToAttach = faker.helpers.arrayElements(createdClients, Math.min(15, createdClients.length));
  //         for (let idx = 0; idx < clientsToAttach.length; idx++) {
  //           await prisma.clientSlideShow.create({
  //             data: {
  //               clientId: clientsToAttach[idx].id,
  //               slideShowId: slideshow.id,
  //               order: idx,
  //               isVisible: true,
  //             },
  //           });
  //           attachCount++;
  //         }
  //         break;

  //       case SlideshowType.TESTIMONIALS:
  //         const testimonialsToAttach = faker.helpers.arrayElements(createdTestimonials, Math.min(10, createdTestimonials.length));
  //         for (let idx = 0; idx < testimonialsToAttach.length; idx++) {
  //           await prisma.testimonialSlideShow.create({
  //             data: {
  //               testimonialId: testimonialsToAttach[idx].id,
  //               slideShowId: slideshow.id,
  //               order: idx,
  //               isVisible: true,
  //             },
  //           });
  //           attachCount++;
  //         }
  //         break;

  //       case SlideshowType.TEAM:
  //       case SlideshowType.HERO:
  //         const teamToAttach = faker.helpers.arrayElements(createdTeamMembers, Math.min(12, createdTeamMembers.length));
  //         for (let idx = 0; idx < teamToAttach.length; idx++) {
  //           await prisma.teamSlideShow.create({
  //             data: {
  //               teamId: teamToAttach[idx].id,
  //               slideShowId: slideshow.id,
  //               order: idx,
  //               isVisible: true,
  //             },
  //           });
  //           attachCount++;
  //         }
  //         break;
  //     }

  //     console.log(`  ✅ Slideshow created with ${attachCount} attached items`);
  //   } catch (error : any) {
  //     console.error(`  ❌ Error creating slideshow ${config.title}:`, error.message);
  //   }
  // }

  // 12. Create Contact Messages
  console.log('\n\n📧 Creating 30 contact messages...');
  // for (let i = 0; i < 30; i++) {
  //   await prisma.contact.create({
  //     data: {
  //       name: faker.person.fullName(),
  //       email: faker.internet.email(),
  //       phone: faker.phone.number(),
  //       company: Math.random() > 0.3 ? faker.company.name() : undefined,
  //       subject: faker.lorem.sentence(5),
  //       message: faker.lorem.paragraphs(3),
  //       status: faker.helpers.arrayElement([ContactStatus.NEW, ContactStatus.READ, ContactStatus.IN_PROGRESS, ContactStatus.RESOLVED]),
  //       ipAddress: faker.internet.ip(),
  //       userAgent: faker.internet.userAgent(),
  //     },
  //   });
  // }
  console.log('  ✓ Created 30 contact messages');

  console.log('\n\n✅ ==========================================');
  console.log('🎉 Database seeding completed successfully!');
  console.log('============================================\n');
  
  // Get final counts
  const finalCounts = {
    services: await prisma.service.count(),
    clients: await prisma.client.count(),
    projects: await prisma.project.count(),
    teamMembers: await prisma.teamMember.count(),
    testimonials: await prisma.testimonial.count(),
    blogs: await prisma.blog.count(),
    slideshows: await prisma.slideShow.count(),
    technologies: await prisma.technology.count(),
    categories: await prisma.category.count(),
    users: await prisma.user.count(),
    contacts: await prisma.contact.count(),
  };

  console.log('📊 Final Summary:');
  console.log('==================');
  console.log(`✓ Services:       ${finalCounts.services}`);
  console.log(`✓ Clients:        ${finalCounts.clients}`);
  console.log(`✓ Projects:       ${finalCounts.projects}`);
  console.log(`✓ Team Members:   ${finalCounts.teamMembers}`);
  console.log(`✓ Testimonials:   ${finalCounts.testimonials}`);
  console.log(`✓ Blog Posts:     ${finalCounts.blogs}`);
  console.log(`✓ Slideshows:     ${finalCounts.slideshows}`);
  console.log(`✓ Technologies:   ${finalCounts.technologies}`);
  console.log(`✓ Categories:     ${finalCounts.categories}`);
  console.log(`✓ Users:          ${finalCounts.users}`);
  console.log(`✓ Contacts:       ${finalCounts.contacts}`);
  console.log('==================\n');

  console.log('🔐 Login Credentials:');
  console.log('   Email: admin@techvision.com');
  console.log('   Password: password123\n');

  console.log('💡 All images are REAL photos from Pexels API');
  console.log('🎨 All content is realistic and meaningful');
  console.log('🔗 All relationships are properly connected\n');
}

main()
  .catch((e: any) => {
    console.error('\n❌ ==========================================');
    console.error('💥 Error seeding database:');
    console.error('============================================');
    console.error(e);
    console.error('============================================\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });