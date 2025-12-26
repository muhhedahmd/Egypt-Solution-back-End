
// @ts-nocheck
import { PrismaClient, SlideshowType, CompositionType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function clearSlideshows() {
  console.log('🧹 Clearing existing slideshows and relations...\n');

  // Delete in order (child tables first)
  await prisma.serviceSlideShow.deleteMany();
  console.log('  ✓ Cleared ServiceSlideShow');

  await prisma.projectSlideShow.deleteMany();
  console.log('  ✓ Cleared ProjectSlideShow');

  await prisma.clientSlideShow.deleteMany();
  console.log('  ✓ Cleared ClientSlideShow');

  await prisma.testimonialSlideShow.deleteMany();
  console.log('  ✓ Cleared TestimonialSlideShow');

  await prisma.teamSlideShow.deleteMany();
  console.log('  ✓ Cleared TeamSlideShow');

  await prisma.slideShow.deleteMany();
  console.log('  ✓ Cleared SlideShow');

  console.log('\n✅ All slideshows and relations cleared!\n');
}

async function seedSlideshows() {
  console.log('🌱 Seeding new slideshows...\n');

  // Fetch existing entities to attach
  const services = await prisma.service.findMany({ where: { isActive: true } });
  const projects = await prisma.project.findMany();
  const clients = await prisma.client.findMany({ where: { isActive: true } });
  const testimonials = await prisma.testimonial.findMany({ where: { isActive: true } });
  const teamMembers = await prisma.teamMember.findMany({ where: { isActive: true } });

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
      type: SlideshowType.SERVICES,
      composition: CompositionType.CAROUSEL,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      autoPlay: true,
      interval: 5000,
      attachType: 'services',
      attachCount: Math.min(8, services.length),
    },
    {
      title: 'All Services Grid',
      description: 'Browse all our services',
      type: SlideshowType.SERVICES,
      composition: CompositionType.GRID,
      background: '#f8f9fa',
      autoPlay: false,
      interval: 0,
      attachType: 'services',
      attachCount: services.length,
    },
    {
      title: 'Services Showcase',
      description: 'Discover what we offer',
      type: SlideshowType.SERVICES,
      composition: CompositionType.FADE,
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
      type: SlideshowType.PROJECTS,
      composition: CompositionType.CAROUSEL,
      background: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
      autoPlay: true,
      interval: 6000,
      attachType: 'projects',
      attachCount: Math.min(10, projects.length),
    },
    {
      title: 'Recent Work',
      description: 'Our latest completed projects',
      type: SlideshowType.PROJECTS,
      composition: CompositionType.GRID,
      background: '#ffffff',
      autoPlay: false,
      interval: 0,
      attachType: 'projects',
      attachCount: Math.min(12, projects.length),
    },
    {
      title: 'Case Studies',
      description: 'Deep dive into our successful projects',
      type: SlideshowType.PROJECTS,
      composition: CompositionType.STACKED,
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
      type: SlideshowType.CLIENTS,
      composition: CompositionType.MARQUEE,
      background: '#f5f5f5',
      autoPlay: true,
      interval: 3000,
      attachType: 'clients',
      attachCount: clients.length,
    },
    {
      title: 'Our Clients',
      description: 'Partners we work with',
      type: SlideshowType.CLIENTS,
      composition: CompositionType.GRID,
      background: '#ffffff',
      autoPlay: false,
      interval: 0,
      attachType: 'clients',
      attachCount: Math.min(16, clients.length),
    },
    {
      title: 'Client Showcase',
      description: 'Featured client partnerships',
      type: SlideshowType.CLIENTS,
      composition: CompositionType.CAROUSEL,
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
      type: SlideshowType.TESTIMONIALS,
      composition: CompositionType.CAROUSEL,
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      autoPlay: true,
      interval: 7000,
      attachType: 'testimonials',
      attachCount: Math.min(10, testimonials.length),
    },
    {
      title: 'Customer Reviews',
      description: 'Feedback from satisfied customers',
      type: SlideshowType.TESTIMONIALS,
      composition: CompositionType.FADE,
      background: '#f0f0f0',
      autoPlay: true,
      interval: 6000,
      attachType: 'testimonials',
      attachCount: Math.min(8, testimonials.length),
    },
    {
      title: 'Success Stories',
      description: 'Hear from our happy clients',
      type: SlideshowType.TESTIMONIALS,
      composition: CompositionType.STACKED,
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
      type: SlideshowType.TEAM,
      composition: CompositionType.GRID,
      background: '#ffffff',
      autoPlay: false,
      interval: 0,
      attachType: 'team',
      attachCount: teamMembers.length,
    },
    {
      title: 'Leadership Team',
      description: 'Our experienced leaders',
      type: SlideshowType.TEAM,
      composition: CompositionType.CAROUSEL,
      background: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)',
      autoPlay: true,
      interval: 5000,
      attachType: 'team',
      attachCount: Math.min(8, teamMembers.length),
    },
    {
      title: 'Team Spotlight',
      description: 'Get to know our talented team',
      type: SlideshowType.TEAM,
      composition: CompositionType.FADE,
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
      type: SlideshowType.HERO,
      composition: CompositionType.SINGLE,
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
      type: SlideshowType.CUSTOM,
      composition: CompositionType.PARALLAX,
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
      const slideshow = await prisma.slideShow.create({
        data: {
          title: config.title,
          slug: slugify(`${config.title}-${randomUUID().substring(0, 6)}`, { lower: true }),
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
          const servicesToAttach = faker.helpers.arrayElements(
            services,
            Math.min(config.attachCount, services.length)
          );
          for (let idx = 0; idx < servicesToAttach.length; idx++) {
            await prisma.serviceSlideShow.create({
              data: {
                serviceId: servicesToAttach[idx].id,
                slideShowId: slideshow.id,
                order: idx,
                isVisible: true,
                customTitle: Math.random() > 0.8 ? faker.lorem.sentence(5) : undefined,
                customDesc: Math.random() > 0.8 ? faker.lorem.sentence(10) : undefined,
              },
            });
            attachCount++;
          }
          break;

        case 'projects':
          const projectsToAttach = faker.helpers.arrayElements(
            projects,
            Math.min(config.attachCount, projects.length)
          );
          for (let idx = 0; idx < projectsToAttach.length; idx++) {
            await prisma.projectSlideShow.create({
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
          const clientsToAttach = faker.helpers.arrayElements(
            clients,
            Math.min(config.attachCount, clients.length)
          );
          for (let idx = 0; idx < clientsToAttach.length; idx++) {
            await prisma.clientSlideShow.create({
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
          const testimonialsToAttach = faker.helpers.arrayElements(
            testimonials,
            Math.min(config.attachCount, testimonials.length)
          );
          for (let idx = 0; idx < testimonialsToAttach.length; idx++) {
            await prisma.testimonialSlideShow.create({
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
          const teamToAttach = faker.helpers.arrayElements(
            teamMembers,
            Math.min(config.attachCount, teamMembers.length)
          );
          for (let idx = 0; idx < teamToAttach.length; idx++) {
            await prisma.teamSlideShow.create({
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
    } catch (error: any) {
      console.error(`  ❌ Error creating slideshow:`, error.message);
    }
  }

  console.log('\n✅ All slideshows created successfully!\n');
}

async function main() {
  console.log('🎬 Starting Slideshow Reset & Seed...\n');

  // Step 1: Clear existing slideshows
  await clearSlideshows();

  // Step 2: Seed new slideshows
  await seedSlideshows();

  // Final summary
  const finalCounts = {
    slideshows: await prisma.slideShow.count(),
    serviceSlides: await prisma.serviceSlideShow.count(),
    projectSlides: await prisma.projectSlideShow.count(),
    clientSlides: await prisma.clientSlideShow.count(),
    testimonialSlides: await prisma.testimonialSlideShow.count(),
    teamSlides: await prisma.teamSlideShow.count(),
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
}

main()
  .catch((e: any) => {
    console.error('\n❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });