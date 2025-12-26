import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper functions
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function getDateDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Sample data
const devices = ['mobile', 'desktop', 'tablet'];
const browsers = ['chrome', 'safari', 'firefox', 'edge'];
const oses = ['windows', 'macos', 'ios', 'android', 'linux'];
const countries = ['US', 'UK', 'EG', 'CA', 'DE', 'FR', 'AU'];
const cities = ['Cairo', 'London', 'New York', 'Toronto', 'Berlin', 'Paris', 'Sydney'];
const utmSources = ['google', 'facebook', 'twitter', 'linkedin', 'newsletter', 'direct'];
const utmMediums = ['organic', 'social', 'email', 'cpc', 'referral', 'none'];
const paths = [
  '/',
  '/about',
  '/contact',
  '/blog/getting-started',
  '/blog/advanced-tips',
  '/blog/best-practices',
  '/services',
  '/pricing',
  '/portfolio',
];

async function seedAnalytics() {
  console.log('🌱 Seeding analytics data...');

  // Clear existing data
//   await prisma.pageView.deleteMany();
//   await prisma.sessionAnalytics.deleteMany();
  await prisma.analytics.deleteMany();

  const DAYS_TO_SEED = 30;
//   const SESSIONS_PER_DAY_MIN = 20;
//   const SESSIONS_PER_DAY_MAX = 100;

//   // Generate data for last 30 days
//   for (let dayAgo = DAYS_TO_SEED - 1; dayAgo >= 0; dayAgo--) {
//     const date = getDateDaysAgo(dayAgo);
//     const sessionsCount = randomInt(SESSIONS_PER_DAY_MIN, SESSIONS_PER_DAY_MAX);

//     console.log(`📅 Day ${DAYS_TO_SEED - dayAgo}/${DAYS_TO_SEED}: Creating ${sessionsCount} sessions...`);

//     // Create sessions for this day
//     for (let i = 0; i < sessionsCount; i++) {
//       const sessionId = `session_${date.getTime()}_${i}`;
//       const device = randomItem(devices);
//       const browser = randomItem(browsers);
//       const os = randomItem(oses);
//       const country = randomItem(countries);
//       const city = randomItem(cities);
//       const utmSource = randomItem(utmSources);
//       const utmMedium = utmSource === 'direct' ? 'none' : randomItem(utmMediums);
      
//       // Random session duration (30s - 10 minutes)
//       const totalDuration = randomInt(30, 600);
      
//       // Random page count (1-8 pages)
//       const pageCount = randomInt(1, 8);
//       const isBounce = pageCount === 1;
      
//       // 5% chance of conversion
//       const converted = Math.random() < 0.05;

//       // Random start time within the day
//       const startedAt = new Date(date);
//       startedAt.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));

//       const endedAt = new Date(startedAt);
//       endedAt.setSeconds(endedAt.getSeconds() + totalDuration);

//       const landingPath = randomItem(paths);
//       const exitPath = randomItem(paths);

//       // Create session
//       await prisma.sessionAnalytics.create({
//         data: {
//           sessionId,
//           firstPagePath: landingPath,
//           lastPagePath: exitPath,
//           pageCount,
//           totalDuration,
//           referrer: utmSource === 'direct' ? null : `https://${utmSource}.com`,
//           utmSource,
//           utmMedium,
//           utmCampaign: Math.random() < 0.3 ? 'summer_campaign' : null,
//           device,
//           browser,
//           os,
//           ipHash: `hash_${randomInt(1000, 9999)}`,
//           country,
//           city,
//           converted,
//           isBounce,
//           startedAt,
//           endedAt,
//         },
//       });

//       // Create page views for this session
//       const visitedPaths: string[] = [landingPath];
//       for (let p = 1; p < pageCount; p++) {
//         let nextPath = randomItem(paths);
//         // Avoid repeating same path
//         while (nextPath === visitedPaths[visitedPaths.length - 1]) {
//           nextPath = randomItem(paths);
//         }
//         visitedPaths.push(nextPath);
//       }

//       for (let p = 0; p < visitedPaths.length; p++) {
//         const path = visitedPaths[p];
//         const pageType = path === '/' 
//           ? 'home' 
//           : path.startsWith('/blog/') 
//           ? 'blog' 
//           : path.replace('/', '') || 'other';

//         const timeOnPage = p < visitedPaths.length - 1 
//           ? randomInt(10, 180) // 10s - 3min for non-exit pages
//           : randomInt(5, 60);   // 5s - 1min for exit page

//         const scrollDepth = randomInt(10, 100);

//         const pageViewTime = new Date(startedAt);
//         pageViewTime.setSeconds(pageViewTime.getSeconds() + (p * 30));

//         await prisma.pageView.create({
//           data: {
//             sessionId,
//             path,
//             pageTitle: `Page: ${path}`,
//             pageType,
//             referrer: p === 0 && utmSource !== 'direct' ? `https://${utmSource}.com` : null,
//             utmSource: p === 0 ? utmSource : null,
//             utmMedium: p === 0 ? utmMedium : null,
//             utmCampaign: p === 0 && Math.random() < 0.3 ? 'summer_campaign' : null,
//             device,
//             browser,
//             os,
//             userAgent: `Mozilla/5.0 (${os}; ${browser})`,
//             ipHash: `hash_${randomInt(1000, 9999)}`,
//             country,
//             city,
//             timeOnPage,
//             scrollDepth,
//             isNewSession: p === 0,
//             isBounce: isBounce && p === 0,
//             createdAt: pageViewTime,
//           },
//         });
//       }
//     }
//   }

  console.log('✅ Sessions and page views created!');
  console.log('📊 Now aggregating into Analytics table...');

  // Aggregate all days into Analytics table
  for (let dayAgo = DAYS_TO_SEED - 1; dayAgo >= 0; dayAgo--) {
    const date = getDateDaysAgo(dayAgo);
    await aggregateDay(date);
  }

  console.log('✅ Analytics aggregation complete!');
  
  // Print summary
  const totalSessions = await prisma.sessionAnalytics.count();
  const totalPageViews = await prisma.pageView.count();
  const totalAnalyticsDays = await prisma.analytics.count();

  console.log('\n📈 Summary:');
  console.log(`   Sessions: ${totalSessions}`);
  console.log(`   Page Views: ${totalPageViews}`);
  console.log(`   Analytics Days: ${totalAnalyticsDays}`);
}

async function aggregateDay(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await prisma.sessionAnalytics.findMany({
    where: { startedAt: { gte: startOfDay, lte: endOfDay } },
  });

  const pageViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
  });

  const uniqueVisitors = sessions.length;
  const totalPageViews = pageViews.length;
  const totalBlogViews = pageViews.filter(pv => pv.pageType === 'blog').length;
  const contacts = sessions.filter(s => s.converted).length;

  const bouncedSessions = sessions.filter(s => s.isBounce).length;
  const bounceRate = uniqueVisitors > 0 ? (bouncedSessions / uniqueVisitors) * 100 : 0;

  const totalTime = sessions.reduce((sum, s) => sum + s.totalDuration, 0);
  const avgSessionTime = uniqueVisitors > 0 ? Math.round(totalTime / uniqueVisitors) : 0;

  const mobileVisitors = sessions.filter(s => s.device === 'mobile').length;
  const desktopVisitors = sessions.filter(s => s.device === 'desktop').length;
  const tabletVisitors = sessions.filter(s => s.device === 'tablet').length;

  const directVisitors = sessions.filter(s => !s.utmMedium || s.utmMedium === 'none').length;
  const searchVisitors = sessions.filter(s => s.utmMedium === 'organic').length;
  const socialVisitors = sessions.filter(s => s.utmMedium === 'social').length;
  const referralVisitors = sessions.filter(s => s.utmMedium === 'referral').length;

  await prisma.analytics.create({
    data: {
      date: startOfDay,
      uniqueVisitors,
      totalPageViews,
      totalBlogViews,
      avgSessionTime,
      bounceRate,
      contacts,
      formSubmissions: contacts,
      mobileVisitors,
      desktopVisitors,
      tabletVisitors,
      directVisitors,
      searchVisitors,
      socialVisitors,
      referralVisitors,
    },
  });

  console.log(`   ✓ ${startOfDay.toISOString().split('T')[0]}: ${uniqueVisitors} visitors`);
}

// Run seed
seedAnalytics()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });