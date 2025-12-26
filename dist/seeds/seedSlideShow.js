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
// @ts-nocheck
const client_1 = require("@prisma/client");
const faker_1 = require("@faker-js/faker");
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
function clearSlideshows() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧹 Clearing existing slideshows and relations...\n');
        // Delete in order (child tables first)
        yield prisma.serviceSlideShow.deleteMany();
        console.log('  ✓ Cleared ServiceSlideShow');
        yield prisma.projectSlideShow.deleteMany();
        console.log('  ✓ Cleared ProjectSlideShow');
        yield prisma.clientSlideShow.deleteMany();
        console.log('  ✓ Cleared ClientSlideShow');
        yield prisma.testimonialSlideShow.deleteMany();
        console.log('  ✓ Cleared TestimonialSlideShow');
        yield prisma.teamSlideShow.deleteMany();
        console.log('  ✓ Cleared TeamSlideShow');
        yield prisma.slideShow.deleteMany();
        console.log('  ✓ Cleared SlideShow');
        console.log('\n✅ All slideshows and relations cleared!\n');
    });
}
function seedSlideshows() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Seeding new slideshows...\n');
        // Fetch existing entities to attach
        const services = yield prisma.service.findMany({ where: { isActive: true } });
        const projects = yield prisma.project.findMany();
        const clients = yield prisma.client.findMany({ where: { isActive: true } });
        const testimonials = yield prisma.testimonial.findMany({ where: { isActive: true } });
        const teamMembers = yield prisma.teamMember.findMany({ where: { isActive: true } });
        console.log('📊 Available entities:');
        console.log(`  - Services: ${services.length}`);
        console.log(`  - Projects: ${projects.length}`);
        console.log(`  - Clients: ${clients.length}`);
        console.log(`  - Testimonials: ${testimonials.length}`);
        console.log(`  - Team Members: ${teamMembers.length}\n`);
        // Slideshow configurations
        const slideshowConfigs = [
            // Services Slideshows
            {
                title: 'Featured Services',
                description: 'Our most popular services',
                type: client_1.SlideshowType.SERVICES,
                composition: client_1.CompositionType.CAROUSEL,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                autoPlay: true,
                interval: 5000,
                attachType: 'services',
                attachCount: Math.min(8, services.length),
            },
            {
                title: 'All Services Grid',
                description: 'Browse all our services',
                type: client_1.SlideshowType.SERVICES,
                composition: client_1.CompositionType.GRID,
                background: '#f8f9fa',
                autoPlay: false,
                interval: 0,
                attachType: 'services',
                attachCount: services.length,
            },
            {
                title: 'Services Showcase',
                description: 'Discover what we offer',
                type: client_1.SlideshowType.SERVICES,
                composition: client_1.CompositionType.FADE,
                background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                autoPlay: true,
                interval: 4000,
                attachType: 'services',
                attachCount: Math.min(6, services.length),
            },
            // Projects Slideshows
            {
                title: 'Portfolio Highlights',
                description: 'Featured projects we are proud of',
                type: client_1.SlideshowType.PROJECTS,
                composition: client_1.CompositionType.CAROUSEL,
                background: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
                autoPlay: true,
                interval: 6000,
                attachType: 'projects',
                attachCount: Math.min(10, projects.length),
            },
            {
                title: 'Recent Work',
                description: 'Our latest completed projects',
                type: client_1.SlideshowType.PROJECTS,
                composition: client_1.CompositionType.GRID,
                background: '#ffffff',
                autoPlay: false,
                interval: 0,
                attachType: 'projects',
                attachCount: Math.min(12, projects.length),
            },
            {
                title: 'Case Studies',
                description: 'Deep dive into our successful projects',
                type: client_1.SlideshowType.PROJECTS,
                composition: client_1.CompositionType.STACKED,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                autoPlay: false,
                interval: 0,
                attachType: 'projects',
                attachCount: Math.min(8, projects.length),
            },
            // Clients Slideshows
            {
                title: 'Trusted By',
                description: 'Companies that trust us',
                type: client_1.SlideshowType.CLIENTS,
                composition: client_1.CompositionType.MARQUEE,
                background: '#f5f5f5',
                autoPlay: true,
                interval: 3000,
                attachType: 'clients',
                attachCount: clients.length,
            },
            {
                title: 'Our Clients',
                description: 'Partners we work with',
                type: client_1.SlideshowType.CLIENTS,
                composition: client_1.CompositionType.GRID,
                background: '#ffffff',
                autoPlay: false,
                interval: 0,
                attachType: 'clients',
                attachCount: Math.min(16, clients.length),
            },
            {
                title: 'Client Showcase',
                description: 'Featured client partnerships',
                type: client_1.SlideshowType.CLIENTS,
                composition: client_1.CompositionType.CAROUSEL,
                background: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
                autoPlay: true,
                interval: 5000,
                attachType: 'clients',
                attachCount: Math.min(12, clients.length),
            },
            // Testimonials Slideshows
            {
                title: 'Client Testimonials',
                description: 'What our clients say',
                type: client_1.SlideshowType.TESTIMONIALS,
                composition: client_1.CompositionType.CAROUSEL,
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                autoPlay: true,
                interval: 7000,
                attachType: 'testimonials',
                attachCount: Math.min(10, testimonials.length),
            },
            {
                title: 'Customer Reviews',
                description: 'Feedback from satisfied customers',
                type: client_1.SlideshowType.TESTIMONIALS,
                composition: client_1.CompositionType.FADE,
                background: '#f0f0f0',
                autoPlay: true,
                interval: 6000,
                attachType: 'testimonials',
                attachCount: Math.min(8, testimonials.length),
            },
            {
                title: 'Success Stories',
                description: 'Hear from our happy clients',
                type: client_1.SlideshowType.TESTIMONIALS,
                composition: client_1.CompositionType.STACKED,
                background: 'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)',
                autoPlay: false,
                interval: 0,
                attachType: 'testimonials',
                attachCount: testimonials.length,
            },
            // Team Slideshows
            {
                title: 'Meet Our Team',
                description: 'The people behind our success',
                type: client_1.SlideshowType.TEAM,
                composition: client_1.CompositionType.GRID,
                background: '#ffffff',
                autoPlay: false,
                interval: 0,
                attachType: 'team',
                attachCount: teamMembers.length,
            },
            {
                title: 'Leadership Team',
                description: 'Our experienced leaders',
                type: client_1.SlideshowType.TEAM,
                composition: client_1.CompositionType.CAROUSEL,
                background: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)',
                autoPlay: true,
                interval: 5000,
                attachType: 'team',
                attachCount: Math.min(8, teamMembers.length),
            },
            {
                title: 'Team Spotlight',
                description: 'Get to know our talented team',
                type: client_1.SlideshowType.TEAM,
                composition: client_1.CompositionType.FADE,
                background: 'linear-gradient(to right, #f8cdda 0%, #1d2b64 100%)',
                autoPlay: true,
                interval: 4500,
                attachType: 'team',
                attachCount: Math.min(12, teamMembers.length),
            },
            // Hero Slideshow
            {
                title: 'Hero Carousel',
                description: 'Main hero section slideshow',
                type: client_1.SlideshowType.HERO,
                composition: client_1.CompositionType.SINGLE,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                autoPlay: true,
                interval: 8000,
                attachType: 'services', // Use services for hero
                attachCount: Math.min(5, services.length),
            },
            // Custom/Mixed Slideshows
            {
                title: 'Company Showcase',
                description: 'Complete overview of our company',
                type: client_1.SlideshowType.CUSTOM,
                composition: client_1.CompositionType.PARALLAX,
                background: '#000000',
                autoPlay: false,
                interval: 0,
                attachType: 'projects',
                attachCount: Math.min(10, projects.length),
            },
        ];
        // Create slideshows with attachments
        for (let i = 0; i < slideshowConfigs.length; i++) {
            const config = slideshowConfigs[i];
            try {
                console.log(`\n[${i + 1}/${slideshowConfigs.length}] Creating: ${config.title}...`);
                // Create the slideshow
                const slideshow = yield prisma.slideShow.create({
                    data: {
                        title: config.title,
                        slug: (0, slugify_1.default)(`${config.title}-${(0, crypto_1.randomUUID)().substring(0, 6)}`, { lower: true }),
                        description: config.description,
                        type: config.type,
                        composition: config.composition,
                        background: config.background,
                        isActive: true,
                        autoPlay: config.autoPlay,
                        interval: config.interval,
                        order: i,
                    },
                });
                let attachCount = 0;
                // Attach entities based on type
                switch (config.attachType) {
                    case 'services':
                        const servicesToAttach = faker_1.faker.helpers.arrayElements(services, Math.min(config.attachCount, services.length));
                        for (let idx = 0; idx < servicesToAttach.length; idx++) {
                            yield prisma.serviceSlideShow.create({
                                data: {
                                    serviceId: servicesToAttach[idx].id,
                                    slideShowId: slideshow.id,
                                    order: idx,
                                    isVisible: true,
                                    customTitle: Math.random() > 0.8 ? faker_1.faker.lorem.sentence(5) : undefined,
                                    customDesc: Math.random() > 0.8 ? faker_1.faker.lorem.sentence(10) : undefined,
                                },
                            });
                            attachCount++;
                        }
                        break;
                    case 'projects':
                        const projectsToAttach = faker_1.faker.helpers.arrayElements(projects, Math.min(config.attachCount, projects.length));
                        for (let idx = 0; idx < projectsToAttach.length; idx++) {
                            yield prisma.projectSlideShow.create({
                                data: {
                                    projectId: projectsToAttach[idx].id,
                                    slideShowId: slideshow.id,
                                    order: idx,
                                    isVisible: true,
                                },
                            });
                            attachCount++;
                        }
                        break;
                    case 'clients':
                        const clientsToAttach = faker_1.faker.helpers.arrayElements(clients, Math.min(config.attachCount, clients.length));
                        for (let idx = 0; idx < clientsToAttach.length; idx++) {
                            yield prisma.clientSlideShow.create({
                                data: {
                                    clientId: clientsToAttach[idx].id,
                                    slideShowId: slideshow.id,
                                    order: idx,
                                    isVisible: true,
                                },
                            });
                            attachCount++;
                        }
                        break;
                    case 'testimonials':
                        const testimonialsToAttach = faker_1.faker.helpers.arrayElements(testimonials, Math.min(config.attachCount, testimonials.length));
                        for (let idx = 0; idx < testimonialsToAttach.length; idx++) {
                            yield prisma.testimonialSlideShow.create({
                                data: {
                                    testimonialId: testimonialsToAttach[idx].id,
                                    slideShowId: slideshow.id,
                                    order: idx,
                                    isVisible: true,
                                },
                            });
                            attachCount++;
                        }
                        break;
                    case 'team':
                        const teamToAttach = faker_1.faker.helpers.arrayElements(teamMembers, Math.min(config.attachCount, teamMembers.length));
                        for (let idx = 0; idx < teamToAttach.length; idx++) {
                            yield prisma.teamSlideShow.create({
                                data: {
                                    teamId: teamToAttach[idx].id,
                                    slideShowId: slideshow.id,
                                    order: idx,
                                    isVisible: true,
                                },
                            });
                            attachCount++;
                        }
                        break;
                }
                console.log(`  ✅ Created with ${attachCount} attached items (${config.attachType})`);
            }
            catch (error) {
                console.error(`  ❌ Error creating slideshow:`, error.message);
            }
        }
        console.log('\n✅ All slideshows created successfully!\n');
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🎬 Starting Slideshow Reset & Seed...\n');
        // Step 1: Clear existing slideshows
        yield clearSlideshows();
        // Step 2: Seed new slideshows
        yield seedSlideshows();
        // Final summary
        const finalCounts = {
            slideshows: yield prisma.slideShow.count(),
            serviceSlides: yield prisma.serviceSlideShow.count(),
            projectSlides: yield prisma.projectSlideShow.count(),
            clientSlides: yield prisma.clientSlideShow.count(),
            testimonialSlides: yield prisma.testimonialSlideShow.count(),
            teamSlides: yield prisma.teamSlideShow.count(),
        };
        console.log('📊 Final Summary:');
        console.log('==================');
        console.log(`✓ Slideshows:           ${finalCounts.slideshows}`);
        console.log(`✓ Service Slides:       ${finalCounts.serviceSlides}`);
        console.log(`✓ Project Slides:       ${finalCounts.projectSlides}`);
        console.log(`✓ Client Slides:        ${finalCounts.clientSlides}`);
        console.log(`✓ Testimonial Slides:   ${finalCounts.testimonialSlides}`);
        console.log(`✓ Team Slides:          ${finalCounts.teamSlides}`);
        console.log('==================\n');
        console.log('🎉 Slideshow reset complete!\n');
    });
}
main()
    .catch((e) => {
    console.error('\n❌ Error:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
