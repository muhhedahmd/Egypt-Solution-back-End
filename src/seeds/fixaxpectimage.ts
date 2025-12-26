// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import sharp from 'sharp';

const prisma = new PrismaClient();

// ============================================================================
// PART 1: Fix Image Dimensions
// ============================================================================

async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
  try {
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const buffer = Buffer.from(response.data);

    // Get dimensions using sharp
    const metadata = await sharp(buffer).metadata();

    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
      };
    }

    return null;
  } catch (error: any) {
    console.error(`  ❌ Error getting dimensions:`, error.message);
    return null;
  }
}

async function fixImageDimensions() {
  console.log('🖼️  Fixing image dimensions...\n');

  // Get all images with incorrect dimensions
  const images = await prisma.image.findMany({
    where: {
      OR: [
        { width: 32 },
        { height: 21 },
        { width: null },
        { height: null },
      ],
    },
  });

  console.log(`📊 Found ${images.length} images to fix\n`);

  let fixed = 0;
  let failed = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    console.log(`\n[${i + 1}/${images.length}] Processing: ${image.filename}`);
    console.log(`  Current: ${image.width}x${image.height}`);

    try {
      // Get real dimensions
      const dimensions = await getImageDimensions(image.url);

      if (dimensions) {
        // Update database
        await prisma.image.update({
          where: { id: image.id },
          data: {
            width: dimensions.width,
            height: dimensions.height,
          },
        });

        console.log(`  ✅ Updated to: ${dimensions.width}x${dimensions.height}`);
        fixed++;
      } else {
        console.log(`  ⚠️  Could not get dimensions, skipping`);
        failed++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      console.error(`  ❌ Error:`, error.message);
      failed++;
    }
  }

  console.log('\n📊 Image Dimensions Fix Summary:');
  console.log('================================');
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${images.length}\n`);
}

// ============================================================================
// PART 2: Clean Empty/Spam Slideshows
// ============================================================================

// async function cleanEmptySlideshows() {
//   console.log('🧹 Cleaning empty slideshows...\n');

//   // Get all slideshows
//   const slideshows = await prisma.slideShow.findMany({
//     include: {
//       services: true,
//       projects: true,
//       clients: true,
//       testimonials: true,
//       team: true,
//     },
//   });

//   console.log(`📊 Checking ${slideshows.length} slideshows\n`);

//   const toDelete: string[] = [];

//   for (const slideshow of slideshows) {
//     const totalSlides =
//       slideshow.services.length +
//       slideshow.projects.length +
//       slideshow.clients.length +
//       slideshow.testimonials.length +
//       slideshow.team.length;

//     console.log(`\n📋 ${slideshow.title}`);
//     console.log(`   Type: ${slideshow.type}`);
//     console.log(`   Total slides: ${totalSlides}`);

//     // Mark for deletion if empty or has only 1-2 slides
//     if (totalSlides === 0) {
//       console.log('   ⚠️  EMPTY - Marked for deletion');
//       toDelete.push(slideshow.id);
//     } else if (totalSlides <= 2) {
//       console.log('   ⚠️  TOO FEW SLIDES (<=2) - Marked for deletion');
//       toDelete.push(slideshow.id);
//     } else {
//       console.log(`   ✅ Valid (${totalSlides} slides)`);
//     }
//   }

//   // Delete marked slideshows
//   if (toDelete.length > 0) {
//     console.log(`\n🗑️  Deleting ${toDelete.length} slideshows...\n`);

//     for (const id of toDelete) {
//       try {
//         // Delete relations first
//         await prisma.serviceSlideShow.deleteMany({ where: { slideShowId: id } });
//         await prisma.projectSlideShow.deleteMany({ where: { slideShowId: id } });
//         await prisma.clientSlideShow.deleteMany({ where: { slideShowId: id } });
//         await prisma.testimonialSlideShow.deleteMany({ where: { slideShowId: id } });
//         await prisma.teamSlideShow.deleteMany({ where: { slideShowId: id } });

//         // Delete slideshow
//         await prisma.slideShow.delete({ where: { id } });
//         console.log(`  ✅ Deleted slideshow`);
//       } catch (error: any) {
//         console.error(`  ❌ Error deleting:`, error.message);
//       }
//     }
//   } else {
//     console.log('\n✅ No empty slideshows found\n');
//   }

//   console.log('\n📊 Cleanup Summary:');
//   console.log('===================');
//   console.log(`🗑️  Deleted: ${toDelete.length}`);
//   console.log(`✅ Remaining: ${slideshows.length - toDelete.length}\n`);
// }

// ============================================================================
// PART 3: Validate and Report
// ============================================================================

async function validateAndReport() {
  console.log('📊 Generating validation report...\n');

  // Check images
  const imageStats = await prisma.image.groupBy({
    by: ['imageType'],
    _count: true,
    _avg: {
      width: true,
      height: true,
    },
  });

  console.log('📷 Image Statistics:');
  console.log('====================');
  for (const stat of imageStats) {
    console.log(`${stat.imageType}:`);
    console.log(`  Count: ${stat._count}`);
    console.log(`  Avg Width: ${Math.round(stat._avg.width || 0)}px`);
    console.log(`  Avg Height: ${Math.round(stat._avg.height || 0)}px`);
  }

  // Check for still broken images
  const brokenImages = await prisma.image.count({
    where: {
      OR: [
        { width: 32 },
        { height: 21 },
        { width: null },
        { height: null },
      ],
    },
  });

  console.log(`\n⚠️  Still broken: ${brokenImages} images\n`);

  // Check slideshows
  const slideshowStats = await prisma.slideShow.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      composition: true,
      _count: {
        select: {
          services: true,
          projects: true,
          clients: true,
          testimonials: true,
          team: true,
        },
      },
    },
  });

  console.log('🎬 Slideshow Statistics:');
  console.log('========================');
  for (const slideshow of slideshowStats) {
    const total =
      slideshow._count.services +
      slideshow._count.projects +
      slideshow._count.clients +
      slideshow._count.testimonials +
      slideshow._count.team;

    console.log(`\n${slideshow.title}`);
    console.log(`  Type: ${slideshow.type}`);
    console.log(`  Composition: ${slideshow.composition}`);
    console.log(`  Total Slides: ${total}`);
    console.log(`  Services: ${slideshow._count.services}`);
    console.log(`  Projects: ${slideshow._count.projects}`);
    console.log(`  Clients: ${slideshow._count.clients}`);
    console.log(`  Testimonials: ${slideshow._count.testimonials}`);
    console.log(`  Team: ${slideshow._count.team}`);
  }

  console.log('\n');
}

// ============================================================================
// PART 4: Alternative - Bulk Update Without Downloading
// ============================================================================

async function estimateDimensionsFromUrl() {
  console.log('🔍 Estimating dimensions from URL patterns...\n');

  const images = await prisma.image.findMany({
    where: {
      OR: [{ width: 32 }, { height: 21 }],
    },
  });

  let updated = 0;

  for (const image of images) {
    let width = 800;
    let height = 600;

    // Estimate based on image type
    switch (image.imageType) {
      case 'SERVICE':
      case 'PROJECT':
        width = 1200;
        height = 800;
        break;
      case 'CLIENT':
        width = 800;
        height = 600;
        break;
      case 'TEAM':
      case 'TESTIMONIAL':
        width = 600;
        height = 600;
        break;
      case 'BLOG':
        width = 1600;
        height = 900;
        break;
      case 'PROFILE':
        width = 400;
        height = 400;
        break;
    }

    // Check if URL contains dimension hints
    const urlMatch = image.url.match(/(\d{3,4})x(\d{3,4})/);
    if (urlMatch) {
      width = parseInt(urlMatch[1]);
      height = parseInt(urlMatch[2]);
    }

    await prisma.image.update({
      where: { id: image.id },
      data: { width, height },
    });

    updated++;
  }

  console.log(`✅ Estimated dimensions for ${updated} images\n`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Database Fix...\n');
  console.log('===========================\n');

  const args = process.argv.slice(2);
  const mode = args[0] || 'all';

  switch (mode) {
    case 'images':
      await fixImageDimensions();
      break;

    case 'slideshows':
      await cleanEmptySlideshows();
      break;

    case 'estimate':
      await estimateDimensionsFromUrl();
      break;

    case 'report':
      await validateAndReport();
      break;

    case 'all':
    default:
      // Step 1: Fix image dimensions
      console.log('📍 STEP 1: Fixing Image Dimensions\n');
      await fixImageDimensions();

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 2: Clean slideshows
      console.log('📍 STEP 2: Cleaning Slideshows\n');
      await cleanEmptySlideshows();

      console.log('\n' + '='.repeat(50) + '\n');

      // Step 3: Generate report
      console.log('📍 STEP 3: Final Report\n');
      await validateAndReport();
      break;
  }

  console.log('\n✅ Database fix completed!\n');
}

main()
  .catch((e: any) => {
    console.error('\n❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

# Run everything (recommended)
npx ts-node scripts/fix-database.ts

# Run specific parts
npx ts-node scripts/fix-database.ts images      # Only fix images
npx ts-node scripts/fix-database.ts slideshows  # Only clean slideshows
npx ts-node scripts/fix-database.ts estimate    # Quick estimate (no download)
npx ts-node scripts/fix-database.ts report      # Only show report

*/