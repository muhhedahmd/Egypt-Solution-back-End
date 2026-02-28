# Software Company Website - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Core Features](#core-features)
7. [User Management](#user-management)
8. [Company Information](#company-information)
9. [Hero Section](#hero-section)
10. [Services Module](#services-module)
11. [Projects/Portfolio Module](#projectsportfolio-module)
12. [Team Management](#team-management)
13. [Client Management](#client-management)
14. [Testimonials](#testimonials)
15. [Blog System](#blog-system)
16. [Slideshow System](#slideshow-system)
17. [Contact & Inquiries](#contact--inquiries)
18. [Media Management](#media-management)
19. [Analytics System](#analytics-system)
20. [Internationalization (i18n)](#internationalization-i18n)
21. [API Endpoints](#api-endpoints)
22. [Setup & Installation](#setup--installation)

---

## Project Overview

This is a full-featured software company website built with modern web technologies. The platform includes portfolio management, blog system, team profiles, client showcases, testimonials, contact forms, and comprehensive analytics tracking. It supports multilingual content (English and Arabic) and provides a complete content management system.

### Key Features

- **Multi-language Support**: Full English and Arabic translation support
- **Portfolio Management**: Showcase projects with technologies, clients, and detailed descriptions
- **Blog Platform**: Full-featured blog with categories, analytics, and SEO optimization
- **Team Profiles**: Display team members with social links and bios
- **Client Showcase**: Display client logos and testimonials
- **Advanced Slideshow System**: Multiple composition types and slideshow configurations
- **Contact Management**: Comprehensive inquiry tracking and management
- **Analytics Dashboard**: Track visitors, page views, sessions, and conversions
- **Media Management**: Image handling with blur hash, optimization, and cloud storage
- **SEO Optimized**: Meta tags, structured data, and search engine optimization
- **Authentication**: Secure user authentication with 2FA support

---

## Project Structure

### Directory Overview

The project follows a well-organized TypeScript/Node.js structure with clear separation of concerns:

```
backEnd/
├── src/                    # Source TypeScript files
├── dist/                   # Compiled JavaScript files (build output)
├── prisma/                 # Database schema and migrations
├── uploads/                # Local file uploads (temporary storage)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Deployment configuration
```

### Source Directory (`src/`)

#### Configuration (`src/config/`)
Centralized configuration files for external services:

- **`keys.ts`**: Environment variables and application keys
- **`prisma.ts`**: Prisma client initialization and connection
- **`redis.ts`**: Redis client configuration for sessions/caching
- **`supabase.ts`**: Supabase client for file storage

#### Controllers (`src/controllers/`)
HTTP request handlers implementing the presentation layer:

- **`authController.ts`**: Authentication (login, register, logout, 2FA)
- **`profileController.ts`**: User profile management
- **`servicesController.ts`**: Services CRUD operations
- **`projectController.ts`**: Portfolio/projects management
- **`teamController.ts`**: Team members management
- **`clientController.ts`**: Clients management
- **`testimonialController.ts`**: Testimonials management
- **`blogController.ts`**: Blog posts and categories
- **`heroController.ts`**: Hero section management
- **`slideShowController.ts`**: Slideshow configurations
- **`contactController.ts`**: Contact form submissions
- **`settingsController.ts`**: Company info/settings
- **`analyticController.ts`**: Analytics data management
- **`statsController.ts`**: Statistics and metrics

#### Services (`src/services/`)
Business logic layer organized by domain:

Each service follows a consistent three-file pattern:

**Pattern:**
- `*.logic.ts`: Core business logic and data processing
- `*.module.ts`: Service orchestration and composition
- `*.repository.ts`: Database operations and queries

**Service Modules:**

1. **Analytics** (`services/analytic/`)
   - `analytic.logic.ts`: Analytics calculations and aggregations
   - `analytic.module.ts`: Analytics service interface
   - `analytic.repository.ts`: Database queries for analytics data

2. **Blog** (`services/blog/`)
   - `blog.logic.ts`: Blog post processing, slug generation
   - `blog.modules.ts`: Blog operations orchestration
   - `blog.repostery.ts`: Blog database operations

3. **Client** (`services/client/`)
   - `client.logic.ts`: Client data processing
   - `client.module.ts`: Client service interface
   - `client.repository.ts`: Client database operations

4. **Company Info** (`services/companyInfo/`)
   - `settingsLogic.ts`: Settings validation and processing
   - `settingsModule.ts`: Settings service interface
   - `SettingsRepostery.ts`: Settings database operations

5. **Contact** (`services/contact/`)
   - `contact.logic.ts`: Contact form validation and processing
   - `contact.module.ts`: Contact service interface
   - `contact.repostery.ts`: Contact database operations

6. **Hero** (`services/hero/`)
   - `hero.logic.ts`: Hero section processing
   - `hero.modules.ts`: Hero service interface
   - `hero.repostery.ts`: Hero database operations

7. **Project** (`services/project/`)
   - `project.logic.ts`: Project data processing
   - `project.modules.ts`: Project service interface
   - `project.repostory.ts`: Project database operations

8. **Services** (`services/service-parts/`)
   - `serices.logic.ts`: Service data processing
   - `service.module.ts`: Service interface
   - `services.Repository.ts`: Service database operations

9. **Slideshow** (`services/slideShow/`)
   - `slideShow.logic.ts`: Slideshow processing
   - `slideShow.repostory.ts`: Slideshow database operations
   - `slidwshow.modules.ts`: Slideshow service interface

10. **Team** (`services/team/`)
    - `team.logic.ts`: Team member processing
    - `team.module.ts`: Team service interface
    - `team.repository.ts`: Team database operations

11. **Testimonials** (`services/testtimonials/`)
    - `testimonial.logic.ts`: Testimonial processing
    - `testimonial.module.ts`: Testimonial service interface
    - `testimonial.repostery.ts`: Testimonial database operations

**Shared Services:**
- **`tokenService.ts`**: JWT token generation and validation
- **`userServics.ts`**: User management operations

#### Routes (`src/routes/`)
API endpoint definitions and route handlers:

- **`authRoutes.ts`**: `/api/auth/*` - Authentication endpoints
- **`profileRoute.ts`**: `/api/profile/*` - User profile endpoints
- **`serviceRoutes.ts`**: `/api/services/*` - Services endpoints
- **`projectRoutes.ts`**: `/api/projects/*` - Projects endpoints
- **`teamRoutes.ts`**: `/api/team/*` - Team endpoints
- **`clientRoutes.ts`**: `/api/clients/*` - Clients endpoints
- **`testimonialRoutes.ts`**: `/api/testimonials/*` - Testimonials endpoints
- **`blogRoutes.ts`**: `/api/blog/*` - Blog endpoints
- **`heroRoutes.ts`**: `/api/hero/*` - Hero section endpoints
- **`slideShowRoutes.ts`**: `/api/slideshows/*` - Slideshow endpoints
- **`ContactRoutes.ts`**: `/api/contact/*` - Contact endpoints
- **`companyInfoRoutes.ts`**: `/api/company/*` - Company info endpoints
- **`analyticRoutes.ts`**: `/api/analytics/*` - Analytics endpoints

#### Middlewares (`src/middlewares/`)
Request processing and validation middleware:

- **`auth.ts`**: JWT authentication middleware
- **`authV2.ts`**: Enhanced authentication with 2FA support
- **`profileComplete.ts`**: Ensures user profile completion
- **`lang.middleware.ts`**: Language detection and i18n support
- **`analyticMiddleWare.ts`**: Analytics tracking middleware
- **`errorHandler.ts`**: Global error handling and formatting

#### Validation (`src/validtation/`)
Zod schema validators for request validation:

- **`user-schema.ts`**: User registration/login validation
- **`services-schema.ts`**: Service creation/update validation
- **`project-schema.ts`**: Project validation schemas
- **`slideShow-schema.ts`**: Slideshow validation
- **`store-schema.ts`**: General store/settings validation
- **`websiteAnalytics.schema.ts`**: Analytics data validation

#### Error Handling (`src/errors/`)

**Custom Error Classes:**
- **`analytic.error.ts`**: Analytics-specific errors
- **`blog.error.ts`**: Blog-related errors
- **`client.error.ts`**: Client management errors
- **`contact.error.ts`**: Contact form errors
- **`hero.error.ts`**: Hero section errors
- **`project.error.ts`**: Project errors
- **`services.error.ts`**: Service errors
- **`team.error.ts`**: Team member errors
- **`testimonal.error.ts`**: Testimonial errors

**Validation Schemas (`errors/schema/`):**
- **`client.validation.schema.ts`**: Client validation
- **`companyInfo.ts`**: Company info validation
- **`contact.validation.schema.ts`**: Contact validation
- **`hero.validation.schema.ts`**: Hero validation
- **`team.validation.schema.ts`**: Team validation
- **`testimonal.validation.schema.ts`**: Testimonial validation

#### Types (`src/types/`)
TypeScript type definitions:

- **`auth.ts`**: Authentication types
- **`blog.ts`**: Blog types
- **`client.ts`**: Client types
- **`contact.ts`**: Contact types
- **`hero.ts`**: Hero types
- **`project.ts`**: Project types
- **`services.ts`**: Service types
- **`slideShow.ts`**: Slideshow types
- **`store.ts`**: Store/settings types
- **`team.ts`**: Team types
- **`testimonal.ts`**: Testimonial types
- **`express/index.d.ts`**: Express request/response extensions

#### Utilities (`src/lib/`)
Helper functions and utilities:

- **`helpers.ts`**: Common utility functions (slugify, formatters, etc.)
- **`jwt.ts`**: JWT token utilities

#### Seeds (`src/seeds/`)
Database seeding scripts for development:

- **`seed.ts`**: Main seeding script
- **`i18nSeed.ts`**: Multi-language content seeding
- **`seedSlideShow.ts`**: Slideshow data seeding
- **`slideShowSeed.ts`**: Alternative slideshow seeding
- **`analytic.ts`**: Analytics data seeding
- **`fixaxpectimage.ts`**: Image data fix script

#### Infrastructure (`src/infra/`)
Infrastructure and queue management:

- **`queue/bull.ts`**: Bull queue configuration for background jobs

#### Entry Points
- **`server.ts`**: Main application entry point
- **`app.ts`**: Express app configuration and middleware setup
- **`uploadthing.ts`**: UploadThing file upload configuration

### Database (`prisma/`)

```
prisma/
├── schema.prisma           # Prisma schema definition
├── migrations/             # Database migration history
│   ├── migration_lock.toml # Migration lock file
│   └── [timestamp]_[name]/ # Individual migrations
│       └── migration.sql
└── generated/              # Auto-generated Prisma Client
    └── client/
```

**Key Migration Files:**
- `20250919200026_init_schema`: Initial schema setup
- `20251001160515_add_slugs_and_image_type`: Add slug fields
- `20251012092322_attach_client_to_slideshows...`: Slideshow enhancements
- `20251123190955_add`: Feature additions
- `20251129214824_enhance`: Schema improvements
- `20260112190947_add`: Latest updates

### Build Output (`dist/`)

The compiled JavaScript output mirrors the `src/` directory structure, generated by TypeScript compiler.

---

## Architecture & Design Patterns

### Layered Architecture

The application follows a **three-tier architecture**:

```
┌─────────────────────────────────────┐
│     Controllers (Presentation)      │  ← HTTP handlers, request/response
├─────────────────────────────────────┤
│      Services (Business Logic)      │  ← Core business rules, validation
├─────────────────────────────────────┤
│    Repositories (Data Access)       │  ← Database operations via Prisma
└─────────────────────────────────────┘
```

#### 1. Presentation Layer (Controllers)
**Responsibility**: Handle HTTP requests/responses

- Parse incoming requests
- Validate input data
- Call appropriate service methods
- Format and return responses
- Handle HTTP-specific concerns (status codes, headers)

**Example Flow:**
```typescript
// Controller receives request
POST /api/services
↓
// Validates request body
// Calls service layer
serviceModule.createService(data)
↓
// Returns HTTP response
res.status(201).json(service)
```

#### 2. Business Logic Layer (Services)

**Responsibility**: Implement core business rules

**Structure (3-file pattern):**

1. **Logic (`*.logic.ts`)**
   - Data transformation
   - Business rule validation
   - Complex calculations
   - Slug generation
   - Data formatting

2. **Module (`*.module.ts`)**
   - Service orchestration
   - Combines logic + repository
   - Transaction management
   - Error handling

3. **Repository (`*.repository.ts`)**
   - Database queries
   - CRUD operations
   - Complex queries with joins
   - Transaction execution

**Example:**
```typescript
// Logic layer
export const processServiceData = (data) => {
  return {
    ...data,
    slug: slugify(data.name),
    // business transformations
  }
}

// Module layer
export const createService = async (data) => {
  const processed = processServiceData(data)
  const service = await serviceRepository.create(processed)
  // Additional orchestration
  return service
}

// Repository layer
export const create = async (data) => {
  return prisma.service.create({ data })
}
```

#### 3. Data Access Layer (Repositories)

**Responsibility**: Database operations

- Prisma queries
- Include relations
- Complex filtering
- Pagination
- Transactions

### Design Patterns

#### 1. Repository Pattern
Abstracts database operations behind a consistent interface.

**Benefits:**
- Database independence
- Easier testing with mocks
- Centralized query logic

#### 2. Dependency Injection
Services receive dependencies (like repositories) rather than creating them.

#### 3. Middleware Chain
Express middleware for cross-cutting concerns:

```
Request → Auth → Language → Analytics → Controller → Response
```

#### 4. Error Handling Strategy

**Custom Error Classes:**
- Domain-specific errors
- HTTP status code mapping
- Structured error responses

**Global Error Handler:**
```typescript
app.use(errorHandler) // Catches all errors
```

#### 5. Validation Strategy

**Two-layer validation:**
1. **Schema Validation** (Zod): Request body structure
2. **Business Validation** (Logic layer): Business rules

### Module Organization

Each feature follows this structure:

```
feature/
├── [feature]Controller.ts    # HTTP layer
├── [feature].module.ts       # Service orchestration
├── [feature].logic.ts        # Business logic
├── [feature].repository.ts   # Data access
├── [feature].error.ts        # Custom errors
├── [feature].schema.ts       # Validation schemas
└── [feature].types.ts        # TypeScript types
```

### Data Flow

**Create Operation:**
```
1. Client Request
   ↓
2. Route Handler (routes/)
   ↓
3. Middleware Chain
   - Authentication
   - Validation
   - Language detection
   ↓
4. Controller (controllers/)
   - Parse request
   - Call service
   ↓
5. Service Module (services/*/module)
   - Orchestrate operation
   ↓
6. Service Logic (services/*/logic)
   - Apply business rules
   - Transform data
   ↓
7. Repository (services/*/repository)
   - Database operation
   ↓
8. Response
   - Format data
   - Send to client
```

### Security Architecture

**Authentication Flow:**
```
1. User Login
   ↓
2. Generate JWT (access + refresh)
   ↓
3. Store session in Redis
   ↓
4. Return tokens to client
   ↓
5. Client sends JWT in headers
   ↓
6. Middleware validates JWT
   ↓
7. Attach user to request
   ↓
8. Controller accesses req.user
```

**2FA Flow:**
```
1. Enable 2FA → Generate secret
2. Verify TOTP code
3. Store 2FA status in session
4. Subsequent logins require TOTP
```

### Internationalization Architecture

**Multi-language Support:**

1. **Language Detection:**
   - Header: `Accept-Language`
   - Query param: `?lang=ar`
   - Default: English (EN)

2. **Translation Storage:**
   - Separate translation tables
   - Unique constraint: (parentId, lang)

3. **Query Strategy:**
   ```typescript
   // Fetch with translation
   const service = await prisma.service.findUnique({
     where: { slug },
     include: {
       serviceTranslation: {
         where: { lang: currentLang }
       }
     }
   })
   ```

### File Upload Architecture

**Strategy:** Supabase Storage + UploadThing

1. **Client uploads via UploadThing**
2. **File stored in Supabase**
3. **Metadata saved to database:**
   - URL, filename, size
   - BlurHash for progressive loading
   - File hash for deduplication

### Analytics Architecture

**Three-level tracking:**

1. **PageView**: Individual page loads
2. **SessionAnalytics**: Aggregated session data
3. **Analytics**: Daily aggregated metrics

**Tracking Flow:**
```
Page Load
↓
Analytics Middleware
↓
Create/Update Session
↓
Log PageView
↓
Aggregate to Daily Analytics (cron/queue)
```

---

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.1.0
- **Database**: PostgreSQL with Prisma ORM v6.10.1
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer with UploadThing integration
- **Email**: Nodemailer v7.0.11 and Resend v6.5.2
- **Session Management**: Redis for session storage
- **Image Processing**: Sharp v0.34.2 with BlurHash support

### Storage & Services
- **Cloud Storage**: Supabase Storage
- **Authentication**: Google OAuth support
- **File Management**: UploadThing for file uploads

### Development Tools
- **TypeScript**: v5.9.3
- **Development Server**: ts-node-dev with hot reload
- **Database Migrations**: Prisma Migrate
- **Seeding**: Faker.js for test data generation

---

## Database Schema

### Overview

The database is organized into several logical modules:

1. **User Management**: Users, Sessions, Profiles
2. **Company Info**: Company details and translations
3. **Hero Section**: Homepage hero configurations
4. **Content Modules**: Services, Projects, Team, Clients
5. **Blog System**: Posts, categories, viewers, analytics
6. **Slideshow System**: Dynamic slideshows with various compositions
7. **Contact System**: Inquiry management and tracking
8. **Media Management**: Images with metadata and relationships
9. **Analytics**: Page views, sessions, and visitor tracking
10. **Translations**: Multi-language support for all content

---

## Core Features

### Enum Types

The system uses several enumerations for type safety:

#### UserRole
- `ADMIN`: Full system access
- `EDITOR`: Content management access
- `VIEWER`: Read-only access

#### ImageType
- `PROFILE`, `SERVICE`, `PROJECT`, `SLIDESHOW`, `CLIENT`, `BLOG`, `TEAM`, `HERO`, `TESTIMONIAL`, `COMPANY_LOGO`

#### SlideshowType
- `SERVICES`, `PROJECTS`, `TESTIMONIALS`, `TEAM`, `CLIENTS`, `HERO`, `CUSTOM`

#### CompositionType
- `SINGLE`, `GRID`, `CAROUSEL`, `STACKED`, `FADE`, `CUSTOM`, `ZOOM`, `PARALLAX`, `COVERFLOW`, `KEN_BURNS`, `FLIP`, `CUBE`, `AUTO_GRID`, `STORY`, `FILMSTRIP`, `LIGHTBOX`, `MARQUEE`

#### ProjectStatus
- `PLANNING`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`

#### ContactStatus
- `NEW`, `READ`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

#### BlogStatus
- `DRAFT`, `PUBLISHED`, `ARCHIVED`

#### Languages (EnumLang)
- `EN`: English
- `AR`: Arabic

---

## User Management

### User Model

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `gender`: MALE | FEMALE | OTHER
- `role`: ADMIN | EDITOR | VIEWER
- `isActive`: Account status
- `is2FA`: Two-factor authentication enabled
- `isVerifiedForEachDevice`: Device verification requirement
- `emailConfirmed`: Email verification status
- `googleId`: Google OAuth identifier

**Relations:**
- One Profile
- Many Sessions
- Many Blogs (as author)

### Session Model

Manages user authentication sessions with device tracking:

**Fields:**
- `userId`: Reference to user
- `token`: Unique session token
- `refreshToken`: For token renewal
- `userAgent`: Browser/device information
- `ipAddress`: Client IP address
- `deviceVerification`: Device is verified
- `twoFactorVerification`: 2FA completed for session
- `expiresAt`: Session expiration timestamp
- `refreshTokenExpiresAt`: Refresh token expiration

**Security Features:**
- Automatic session expiration
- Device-based verification
- IP tracking for security monitoring
- Refresh token rotation

### Profile Model

Extended user information:

**Fields:**
- `phone`: Contact number
- `dateOfBirth`: User's birth date
- `bio`: User biography
- `avatarId`: Profile image reference
- `isProfileComplete`: Profile completion status

---

## Company Information

### CompanyInfo Model

Central company details with multi-language support:

**Basic Information:**
- `name`: Company name
- `tagline`: Company slogan
- `description`: Company description
- `email`: Contact email
- `phone`: Contact phone
- `address`, `city`, `country`, `postalCode`: Location details

**Social Media:**
- `facebook`, `twitter`, `linkedin`, `instagram`, `github`, `youtube`, `website`

**SEO:**
- `metaTitle`: Page title for search engines
- `metaDescription`: Meta description
- `metaKeywords`: SEO keywords

**Branding:**
- `logoId`: Company logo image reference
- `lang`: Default language (EN | AR)

### CompanyTranslation Model

Translated versions of company information:

**Fields:**
- `lang`: Language code (EN | AR)
- `name`: Translated company name
- `tagline`: Translated tagline
- `description`: Translated description
- `footerText`: Translated footer text
- `metaTitle`, `metaDescription`, `metaKeywords`: Translated SEO fields

**Constraints:**
- Unique combination of `companyId` and `lang`

---

## Hero Section

### Hero Model

Dynamic homepage hero section with flexible layouts:

**Content:**
- `name`: Hero identifier (default: "Main Hero")
- `title`: Main headline
- `subtitle`: Secondary headline
- `description`: Detailed description text

**Background:**
- `backgroundImageId`: Image reference
- `backgroundColor`: Fallback/overlay color
- `backgroundVideo`: Video URL for video backgrounds
- `overlayColor`: Overlay color for images/videos
- `overlayOpacity`: Overlay transparency (0-1)

**Call-to-Action Buttons:**

**Primary CTA:**
- `ctaText`: Button text (default: "Get Started")
- `ctaUrl`: Link destination (default: "/contact")
- `ctaVariant`: PRIMARY | SECONDARY | GHOST | LINK

**Secondary CTA:**
- `secondaryCtaText`: Optional second button text
- `secondaryCtaUrl`: Second button destination
- `secondaryCtaVariant`: Button style

**Layout & Styling:**
- `alignment`: LEFT | CENTER | RIGHT
- `variant`: CENTERED | SPLIT | IMAGE_BACKGROUND | MINIMAL | FULL_SCREEN
- `minHeight`: Minimum section height in pixels (default: 600)
- `titleSize`: Text size class (default: "4xl")
- `titleColor`: Headline color (default: "#000000")
- `subtitleColor`: Subtitle color (default: "#666666")
- `descriptionColor`: Description text color (default: "#888888")

**Advanced Features:**
- `showScrollIndicator`: Display scroll-down indicator
- `customCSS`: Custom CSS for advanced styling
- `styleOverrides`: JSON object for style overrides

### HeroTranslation Model

Multi-language support for hero content:

**Translated Fields:**
- `name`, `title`, `subtitle`, `description`
- `ctaText`, `secondaryCtaText`

---

## Services Module

### Service Model

Company services/offerings with portfolio integration:

**Basic Information:**
- `name`: Service name
- `slug`: URL-friendly identifier (unique)
- `description`: Short description
- `richDescription`: Full HTML description
- `icon`: Icon name or URL

**Display:**
- `imageId`: Featured image reference
- `price`: Pricing information (e.g., "Starting from $5000")
- `isActive`: Visibility status
- `isFeatured`: Feature on homepage
- `order`: Display order

**Relations:**
- Many Projects (services can be linked to portfolio projects)
- Many ServiceSlideshows
- Many Contacts (inquiry references)

### ServiceTranslation Model

Translated service content:

**Fields:**
- `lang`: EN | AR
- `name`: Translated service name
- `description`: Translated short description
- `richDescription`: Translated full description

---

## Projects/Portfolio Module

### Project Model

Portfolio projects showcasing company work:

**Basic Information:**
- `title`: Project name
- `slug`: URL-friendly identifier
- `description`: Short project description
- `richDescription`: Detailed HTML description

**Client Information:**
- `clientName`: Client contact name
- `clientCompany`: Client organization
- `projectUrl`: Live project URL
- `githubUrl`: Source code repository

**Status & Timeline:**
- `status`: PLANNING | IN_PROGRESS | COMPLETED | ON_HOLD
- `startDate`: Project start date
- `endDate`: Project completion date

**Display:**
- `imageId`: Featured project image
- `isFeatured`: Show on homepage/portfolio highlights
- `order`: Display order in listings

**Relations:**
- Many Services (project can use multiple services)
- Many Technologies (tech stack used)
- Many ProjectSlideshows

### Technology Model

Technologies and tools used in projects:

**Fields:**
- `name`: Technology name (unique)
- `slug`: URL identifier
- `icon`: Icon name or URL
- `category`: Technology category (e.g., "Frontend", "Backend", "Database")

**Relations:**
- Many Projects (through ProjectTechnology junction table)

### TechnologyTranslation Model

Translated technology information:

**Fields:**
- `name`: Translated technology name
- `category`: Translated category name

### ProjectTechnology Model

Many-to-many relationship between projects and technologies:

**Composite Primary Key:**
- `projectId` + `technologyId`

### ProjectTranslation Model

Multi-language project content:

**Fields:**
- `title`: Translated project title
- `description`: Translated short description
- `richDescription`: Translated detailed description

---

## Team Management

### TeamMember Model

Company team member profiles:

**Basic Information:**
- `name`: Full name
- `slug`: URL-friendly identifier
- `position`: Job title/role
- `bio`: Biography/description
- `email`: Contact email
- `phone`: Contact phone

**Social Links:**
- `linkedin`: LinkedIn profile URL
- `github`: GitHub profile URL
- `twitter`: Twitter/X profile URL

**Display:**
- `imageId`: Profile photo reference
- `isActive`: Visibility status
- `isFeatured`: Feature on team page
- `order`: Display order

**Relations:**
- Many TeamSlideshows

### TeamMemberTranslation Model

Translated team member information:

**Fields:**
- `name`: Translated name
- `position`: Translated job title
- `bio`: Translated biography

---

## Client Management

### Client Model

Client companies and organizations:

**Basic Information:**
- `name`: Client/company name
- `slug`: URL identifier
- `description`: Short description
- `richDescription`: Detailed description
- `website`: Client website URL
- `industry`: Business sector/industry

**Images:**
- `imageId`: Featured image
- `logoId`: Company logo

**Display:**
- `isActive`: Visibility status
- `isFeatured`: Feature on clients page
- `order`: Display order

**Relations:**
- Many ClientSlideshows

### ClientTranslation Model

Multi-language client information:

**Fields:**
- `name`: Translated client name
- `description`: Translated short description
- `richDescription`: Translated detailed description
- `industry`: Translated industry name

---

## Testimonials

### Testimonial Model

Client testimonials and reviews:

**Client Information:**
- `clientName`: Person providing testimonial
- `clientPosition`: Job title
- `clientCompany`: Company name

**Content:**
- `content`: Testimonial text
- `rating`: Star rating (1-5, default: 5)
- `avatarId`: Client photo reference

**Display:**
- `isActive`: Visibility status
- `isFeatured`: Feature on homepage
- `order`: Display order

**Relations:**
- Many TestimonialSlideshows

### TestimonialTranslation Model

Translated testimonials:

**Fields:**
- `clientName`: Translated name
- `clientPosition`: Translated position
- `clientCompany`: Translated company name
- `content`: Translated testimonial text

---

## Blog System

### Blog Model

Full-featured blog post management:

**Content:**
- `title`: Post title
- `slug`: URL-friendly identifier (unique)
- `excerpt`: Short summary
- `content`: Full post content (HTML/Markdown)
- `imageId`: Featured image

**Author & Status:**
- `authorId`: Reference to User (author)
- `status`: DRAFT | PUBLISHED | ARCHIVED
- `publishedAt`: Publication timestamp
- `readingTime`: Estimated reading time in minutes

**Display:**
- `isFeatured`: Feature on blog homepage

**SEO:**
- `metaTitle`: Custom page title
- `metaDescription`: Meta description
- `metaKeywords`: SEO keywords

**Relations:**
- Many Categories (through BlogCategory)
- Many BlogViewers (analytics)

### BlogViewer Model

Track individual blog post views for analytics:

**Identification:**
- `blogId`: Reference to blog post
- `sessionId`: Unique session identifier
- `ipHash`: Hashed IP address (privacy-compliant)
- `userAgent`: Browser/device information

**Analytics Metadata:**
- `referrer`: Traffic source URL
- `country`: Visitor country (from IP geolocation)
- `device`: mobile | tablet | desktop
- `viewedAt`: View timestamp
- `duration`: Time spent reading (seconds)

**Constraints:**
- Unique combination of `blogId` and `sessionId` (prevents duplicate counting)

### Category Model

Blog post categorization:

**Fields:**
- `name`: Category name (unique)
- `slug`: URL identifier (unique)

**Relations:**
- Many Blogs (through BlogCategory)

### BlogCategory Model

Many-to-many relationship between blogs and categories:

**Composite Primary Key:**
- `blogId` + `categoryId`

### BlogTranslation Model

Multi-language blog content:

**Fields:**
- `title`: Translated title
- `excerpt`: Translated excerpt
- `content`: Translated full content
- `metaTitle`, `metaDescription`, `metaKeywords`: Translated SEO fields

### CategoryTranslation Model

Translated category names:

**Fields:**
- `name`: Translated category name

---

## Slideshow System

The slideshow system allows flexible content presentation with various composition types and automatic content management.

### SlideShow Model

Master slideshow configuration:

**Basic Information:**
- `title`: Slideshow title
- `slug`: URL identifier (unique)
- `description`: Slideshow description
- `type`: SERVICES | PROJECTS | TESTIMONIALS | TEAM | CLIENTS | HERO | CUSTOM

**Composition:**
- `composition`: Display style (SINGLE, GRID, CAROUSEL, STACKED, FADE, ZOOM, PARALLAX, COVERFLOW, KEN_BURNS, FLIP, CUBE, AUTO_GRID, STORY, FILMSTRIP, LIGHTBOX, MARQUEE)
- `background`: CSS color or gradient

**Behavior:**
- `isActive`: Visibility status
- `autoPlay`: Auto-advance slides
- `interval`: Time between slides (milliseconds, default: 5000)
- `order`: Display order

**Relations:**
- Many ServiceSlideshows
- Many ProjectSlideshows
- Many ClientSlideshows
- Many TestimonialSlideshows
- Many TeamSlideshows

### Junction Table Models

Each content type has a junction table linking it to slideshows:

#### ServiceSlideShow
- `serviceId` + `slideShowId`
- `order`: Slide order
- `isVisible`: Individual slide visibility
- `customTitle`: Override service title
- `customDesc`: Override service description

#### ProjectSlideShow
- `projectId` + `slideShowId`
- `order`: Slide order
- `isVisible`: Individual slide visibility

#### ClientSlideShow
- `clientId` + `slideShowId`
- `order`: Slide order
- `isVisible`: Individual slide visibility

#### TestimonialSlideShow
- `testimonialId` + `slideShowId`
- `order`: Slide order
- `isVisible`: Individual slide visibility

#### TeamSlideShow
- `teamId` + `slideShowId`
- `order`: Slide order
- `isVisible`: Individual slide visibility

### SlideShowTranslation Model

Multi-language slideshow content:

**Fields:**
- `title`: Translated title
- `description`: Translated description

---

## Contact & Inquiries

### Contact Model

Comprehensive inquiry and contact form management:

**Contact Information:**
- `name`: Contact person name
- `email`: Contact email
- `phone`: Phone number (optional)
- `company`: Company name (optional)

**Inquiry Details:**
- `category`: GENERAL_INQUIRY | SUPPORT | SALES | PARTNERSHIP | FEEDBACK | COMPLAINT | SERVICE_INQUIRY | OTHER
- `subject`: Inquiry subject
- `message`: Full message text
- `serviceId`: Reference to specific service (optional)
- `budget`: Project budget information
- `timeline`: Project timeline requirements

**Status Management:**
- `status`: NEW | READ | IN_PROGRESS | RESOLVED | CLOSED
- `priority`: LOW | MEDIUM | HIGH | URGENT
- `resolved`: Boolean resolution flag

**Response Tracking:**
- `respondedAt`: Response timestamp
- `respondedBy`: User who responded
- `notes`: Internal notes
- `response`: Response text

**Analytics:**
- `ipAddress`: Client IP
- `userAgent`: Browser/device info
- `source`: Traffic source
- `referrer`: Referring URL
- `readAt`: First read timestamp
- `viewCount`: Number of times viewed

**Indexes:**
- Status, priority, category, serviceId, email, createdAt, resolved

---

## Media Management

### Image Model

Centralized image management with metadata:

**File Information:**
- `filename`: Original filename
- `url`: Public URL
- `alt`: Alt text for accessibility
- `key`: Storage key/path
- `type`: File MIME type

**Metadata:**
- `size`: File size in bytes
- `width`: Image width in pixels
- `height`: Image height in pixels
- `blurHash`: BlurHash string for placeholders
- `fileHash`: File content hash (for deduplication)

**Classification:**
- `imageType`: PROFILE | SERVICE | PROJECT | SLIDESHOW | CLIENT | BLOG | TEAM | HERO | TESTIMONIAL | COMPANY_LOGO
- `customId`: Custom identifier for specific use cases

**Relations:**
Multiple reverse relations to:
- Profile avatars
- Services, Projects, Clients (both images and logos)
- Testimonials, Team members, Blogs
- Company info logos
- Hero background images

**Features:**
- Automatic blur hash generation for progressive loading
- File deduplication via hash checking
- Cloud storage integration (Supabase)
- Image optimization with Sharp

---

## Analytics System

### Analytics Model

Daily aggregated analytics data:

**Date:**
- `date`: Unique date (one record per day)

**Traffic Metrics:**
- `uniqueVisitors`: Unique sessions per day
- `totalPageViews`: Total page loads
- `totalBlogViews`: Blog-specific views

**Engagement Metrics:**
- `avgSessionTime`: Average seconds per session
- `bounceRate`: Percentage (0-100)

**Conversion Metrics:**
- `contacts`: Contact form submissions
- `formSubmissions`: Total form submissions

**Device Breakdown:**
- `mobileVisitors`: Mobile device count
- `desktopVisitors`: Desktop device count
- `tabletVisitors`: Tablet device count

**Traffic Sources:**
- `directVisitors`: Direct traffic
- `searchVisitors`: Search engine traffic
- `socialVisitors`: Social media traffic
- `referralVisitors`: Referral traffic

### SessionAnalytics Model

Individual session tracking:

**Session Information:**
- `sessionId`: Unique session identifier
- `startedAt`: Session start time
- `endedAt`: Session end time

**Navigation:**
- `firstPagePath`: Landing page
- `lastPagePath`: Exit page
- `pageCount`: Pages viewed in session
- `totalDuration`: Total session time (seconds)

**Traffic Source:**
- `referrer`: Referring URL
- `utmSource`: UTM source parameter
- `utmMedium`: UTM medium parameter
- `utmCampaign`: UTM campaign parameter

**Device & Browser:**
- `device`: mobile | desktop | tablet
- `browser`: Browser name
- `os`: Operating system

**Location:**
- `ipHash`: Hashed IP (privacy-compliant)
- `country`: Country code
- `city`: City name

**Behavior:**
- `converted`: Did user submit a form?
- `isBounce`: Single page visit?

### PageView Model

Individual page view tracking:

**Session:**
- `sessionId`: Cookie-based session ID

**Page Information:**
- `path`: Page URL path (e.g., "/blog/my-post")
- `pageTitle`: Page title
- `pageType`: blog | home | about | contact | etc.

**Traffic Source:**
- `referrer`: Referring URL
- `utmSource`: Campaign source
- `utmMedium`: Campaign medium
- `utmCampaign`: Campaign name

**Device & Browser:**
- `device`: mobile | desktop | tablet
- `browser`: Browser name
- `os`: Operating system
- `userAgent`: Full user agent string

**Location:**
- `ipHash`: Hashed IP address
- `country`: Country code
- `city`: City name

**Engagement:**
- `timeOnPage`: Seconds on page
- `scrollDepth`: Percentage scrolled (0-100)

**Session Data:**
- `isNewSession`: First page of session?
- `isBounce`: Only page viewed?
- `createdAt`: View timestamp

**Indexes:**
- sessionId, path, pageType, createdAt, referrer, utmSource

---

## Internationalization (i18n)

The system supports full multi-language content with English (EN) and Arabic (AR) translations.

### Translation Models

Every major content type has a corresponding translation model:

1. **CompanyTranslation**: Company info
2. **HeroTranslation**: Hero sections
3. **ServiceTranslation**: Services
4. **ProjectTranslation**: Projects
5. **TechnologyTranslation**: Technologies
6. **TeamMemberTranslation**: Team members
7. **ClientTranslation**: Clients
8. **TestimonialTranslation**: Testimonials
9. **BlogTranslation**: Blog posts
10. **CategoryTranslation**: Categories
11. **SlideShowTranslation**: Slideshows
12. **FooterTranslation**: Footer content
13. **FooterColumnTranslation**: Footer columns
14. **FooterLinkTranslation**: Footer links
15. **HeaderTranslation**: Header content
16. **HeaderNavItemTranslation**: Navigation items

### Translation Pattern

All translation models follow a consistent pattern:

```typescript
{
  id: string (CUID)
  lang: EnumLang (EN | AR)
  [translatable fields...]
  
  // Relation to parent
  [parentModel]: Parent
  [parentId]: string
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Unique constraint
  @@unique([parentId, lang])
  @@index([lang])
}
```

### Implementation Notes

1. **Unique Constraint**: Each parent can have only one translation per language
2. **Cascade Delete**: Translations are deleted when parent is deleted
3. **Language Index**: Optimizes queries by language
4. **Required Relations**: All translations must reference a parent entity

---

## API Endpoints

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints (`authRoutes.ts`)

**Base Path:** `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| POST | `/refresh` | Refresh access token | Yes |
| POST | `/verify-email` | Verify email address | No |
| POST | `/resend-verification` | Resend verification email | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/2fa/enable` | Enable two-factor authentication | Yes |
| POST | `/2fa/verify` | Verify 2FA code | Yes |
| POST | `/2fa/disable` | Disable 2FA | Yes |
| GET | `/me` | Get current user info | Yes |
| POST | `/google` | Google OAuth login | No |

**Example Request:**
```json
// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ADMIN" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### Profile Endpoints (`profileRoute.ts`)

**Base Path:** `/api/profile`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user profile | Yes |
| PUT | `/` | Update profile | Yes |
| POST | `/avatar` | Upload profile avatar | Yes |
| DELETE | `/avatar` | Remove avatar | Yes |
| GET | `/completion-status` | Check profile completion | Yes |

---

### Services Endpoints (`serviceRoutes.ts`)

**Base Path:** `/api/services`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List all services | No | - |
| GET | `/:slug` | Get service by slug | No | - |
| POST | `/` | Create service | Yes | ADMIN |
| PUT | `/:id` | Update service | Yes | ADMIN |
| DELETE | `/:id` | Delete service | Yes | ADMIN |
| PATCH | `/:id/toggle-active` | Toggle active status | Yes | ADMIN |
| PATCH | `/:id/toggle-featured` | Toggle featured status | Yes | ADMIN |
| PATCH | `/:id/reorder` | Update display order | Yes | ADMIN |

**Query Parameters (List):**
- `lang`: Language code (en, ar)
- `isActive`: Filter by active status
- `isFeatured`: Filter featured services
- `page`: Page number
- `limit`: Items per page

**Example Request:**
```json
// POST /api/services
{
  "name": "Web Development",
  "description": "Custom web applications",
  "richDescription": "<p>Full HTML description</p>",
  "icon": "code",
  "price": "Starting from $5000",
  "isActive": true,
  "isFeatured": true,
  "translations": {
    "ar": {
      "name": "تطوير الويب",
      "description": "تطبيقات ويب مخصصة"
    }
  }
}
```

---

### Projects Endpoints (`projectRoutes.ts`)

**Base Path:** `/api/projects`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List all projects | No | - |
| GET | `/:slug` | Get project by slug | No | - |
| POST | `/` | Create project | Yes | ADMIN/EDITOR |
| PUT | `/:id` | Update project | Yes | ADMIN/EDITOR |
| DELETE | `/:id` | Delete project | Yes | ADMIN |
| PATCH | `/:id/toggle-featured` | Toggle featured | Yes | ADMIN |
| POST | `/:id/technologies` | Add technologies | Yes | ADMIN |
| DELETE | `/:id/technologies/:techId` | Remove technology | Yes | ADMIN |

**Query Parameters:**
- `status`: PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD
- `isFeatured`: Filter featured projects
- `serviceId`: Filter by service
- `technologyId`: Filter by technology
- `lang`: Language code

---

### Team Endpoints (`teamRoutes.ts`)

**Base Path:** `/api/team`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List team members | No | - |
| GET | `/:slug` | Get team member | No | - |
| POST | `/` | Create team member | Yes | ADMIN |
| PUT | `/:id` | Update team member | Yes | ADMIN |
| DELETE | `/:id` | Delete team member | Yes | ADMIN |
| PATCH | `/:id/toggle-active` | Toggle active status | Yes | ADMIN |
| PATCH | `/:id/toggle-featured` | Toggle featured | Yes | ADMIN |

---

### Clients Endpoints (`clientRoutes.ts`)

**Base Path:** `/api/clients`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List clients | No | - |
| GET | `/:slug` | Get client by slug | No | - |
| POST | `/` | Create client | Yes | ADMIN |
| PUT | `/:id` | Update client | Yes | ADMIN |
| DELETE | `/:id` | Delete client | Yes | ADMIN |
| PATCH | `/:id/toggle-featured` | Toggle featured | Yes | ADMIN |

---

### Testimonials Endpoints (`testimonialRoutes.ts`)

**Base Path:** `/api/testimonials`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List testimonials | No | - |
| GET | `/:id` | Get testimonial | No | - |
| POST | `/` | Create testimonial | Yes | ADMIN |
| PUT | `/:id` | Update testimonial | Yes | ADMIN |
| DELETE | `/:id` | Delete testimonial | Yes | ADMIN |
| PATCH | `/:id/toggle-featured` | Toggle featured | Yes | ADMIN |

**Query Parameters:**
- `isFeatured`: Filter featured
- `isActive`: Filter active
- `minRating`: Minimum rating filter
- `lang`: Language code

---

### Blog Endpoints (`blogRoutes.ts`)

**Base Path:** `/api/blog`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List blog posts | No | - |
| GET | `/published` | List published posts | No | - |
| GET | `/:slug` | Get post by slug | No | - |
| POST | `/` | Create post | Yes | ADMIN/EDITOR |
| PUT | `/:id` | Update post | Yes | ADMIN/EDITOR |
| DELETE | `/:id` | Delete post | Yes | ADMIN |
| PATCH | `/:id/publish` | Publish post | Yes | ADMIN/EDITOR |
| PATCH | `/:id/unpublish` | Unpublish post | Yes | ADMIN/EDITOR |
| POST | `/:id/view` | Track blog view | No | - |
| GET | `/:id/analytics` | Get post analytics | Yes | ADMIN |
| GET | `/categories` | List categories | No | - |
| POST | `/categories` | Create category | Yes | ADMIN |
| PUT | `/categories/:id` | Update category | Yes | ADMIN |
| DELETE | `/categories/:id` | Delete category | Yes | ADMIN |

**Query Parameters (List):**
- `status`: DRAFT, PUBLISHED, ARCHIVED
- `categoryId`: Filter by category
- `isFeatured`: Featured posts only
- `authorId`: Filter by author
- `search`: Search in title/content
- `lang`: Language code
- `page`, `limit`: Pagination

**Example Request:**
```json
// POST /api/blog
{
  "title": "Getting Started with React",
  "slug": "getting-started-with-react",
  "excerpt": "Learn React basics",
  "content": "Full markdown/HTML content...",
  "status": "PUBLISHED",
  "isFeatured": true,
  "categoryIds": ["cat1", "cat2"],
  "metaTitle": "React Tutorial",
  "metaDescription": "Complete React guide",
  "translations": {
    "ar": {
      "title": "البدء مع React",
      "excerpt": "تعلم أساسيات React"
    }
  }
}
```

---

### Hero Section Endpoints (`heroRoutes.ts`)

**Base Path:** `/api/hero`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get active hero | No | - |
| GET | `/all` | List all heroes | Yes | ADMIN |
| GET | `/:id` | Get hero by ID | Yes | ADMIN |
| POST | `/` | Create hero | Yes | ADMIN |
| PUT | `/:id` | Update hero | Yes | ADMIN |
| DELETE | `/:id` | Delete hero | Yes | ADMIN |
| PATCH | `/:id/activate` | Set as active hero | Yes | ADMIN |

---

### Slideshow Endpoints (`slideShowRoutes.ts`)

**Base Path:** `/api/slideshows`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List slideshows | No | - |
| GET | `/:slug` | Get slideshow by slug | No | - |
| GET | `/type/:type` | Get by type | No | - |
| POST | `/` | Create slideshow | Yes | ADMIN |
| PUT | `/:id` | Update slideshow | Yes | ADMIN |
| DELETE | `/:id` | Delete slideshow | Yes | ADMIN |
| POST | `/:id/items` | Add items to slideshow | Yes | ADMIN |
| DELETE | `/:id/items/:itemId` | Remove item | Yes | ADMIN |
| PATCH | `/:id/items/reorder` | Reorder items | Yes | ADMIN |

**Slideshow Types:**
- SERVICES
- PROJECTS
- TESTIMONIALS
- TEAM
- CLIENTS
- HERO
- CUSTOM

---

### Contact Endpoints (`ContactRoutes.ts`)

**Base Path:** `/api/contact`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Submit contact form | No | - |
| GET | `/` | List all contacts | Yes | ADMIN |
| GET | `/:id` | Get contact by ID | Yes | ADMIN |
| PATCH | `/:id/status` | Update status | Yes | ADMIN |
| PATCH | `/:id/priority` | Update priority | Yes | ADMIN |
| POST | `/:id/respond` | Add response | Yes | ADMIN |
| PATCH | `/:id/resolve` | Mark as resolved | Yes | ADMIN |
| DELETE | `/:id` | Delete contact | Yes | ADMIN |

**Contact Form Example:**
```json
// POST /api/contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc",
  "subject": "Project Inquiry",
  "message": "We need a custom web application...",
  "category": "SERVICE_INQUIRY",
  "serviceId": "service-id-here",
  "budget": "$10,000 - $25,000",
  "timeline": "3-6 months"
}
```

**Query Parameters (List):**
- `status`: NEW, READ, IN_PROGRESS, RESOLVED, CLOSED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `category`: Filter by category
- `serviceId`: Filter by service
- `resolved`: Filter by resolution status
- `dateFrom`, `dateTo`: Date range filter

---

### Company Info Endpoints (`companyInfoRoutes.ts`)

**Base Path:** `/api/company`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get company info | No | - |
| PUT | `/` | Update company info | Yes | ADMIN |
| POST | `/logo` | Upload company logo | Yes | ADMIN |
| DELETE | `/logo` | Remove logo | Yes | ADMIN |

---

### Analytics Endpoints (`analyticRoutes.ts`)

**Base Path:** `/api/analytics`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/dashboard` | Dashboard overview | Yes | ADMIN |
| GET | `/daily` | Daily analytics | Yes | ADMIN |
| GET | `/range` | Date range analytics | Yes | ADMIN |
| GET | `/traffic-sources` | Traffic source breakdown | Yes | ADMIN |
| GET | `/top-pages` | Most viewed pages | Yes | ADMIN |
| GET | `/devices` | Device breakdown | Yes | ADMIN |
| GET | `/locations` | Geographic data | Yes | ADMIN |
| POST | `/pageview` | Track page view | No | - |
| POST | `/session/start` | Start session | No | - |
| POST | `/session/update` | Update session | No | - |
| POST | `/session/end` | End session | No | - |

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `groupBy`: day, week, month
- `page`: Page path filter
- `device`: Device type filter

**Dashboard Response Example:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalVisitors": 15420,
      "totalPageViews": 48350,
      "avgSessionTime": 180,
      "bounceRate": 42.5,
      "totalContacts": 234
    },
    "devices": {
      "mobile": 8520,
      "desktop": 6100,
      "tablet": 800
    },
    "trafficSources": {
      "direct": 6500,
      "search": 5200,
      "social": 2400,
      "referral": 1320
    },
    "topPages": [
      { "path": "/", "views": 12400 },
      { "path": "/blog", "views": 8200 }
    ]
  }
}
```

---

### Stats Endpoints (`statsController.ts`)

**Base Path:** `/api/stats`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/overview` | General statistics | Yes | ADMIN |
| GET | `/content` | Content statistics | Yes | ADMIN |
| GET | `/engagement` | Engagement metrics | Yes | ADMIN |

**Example Response:**
```json
{
  "contentStats": {
    "totalServices": 12,
    "totalProjects": 45,
    "totalBlogPosts": 120,
    "totalTeamMembers": 8,
    "totalClients": 32
  },
  "engagementStats": {
    "totalContacts": 234,
    "pendingContacts": 12,
    "resolvedContacts": 198,
    "avgResponseTime": "4.5 hours"
  }
}
```

---

### Common Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional error details */ }
  }
}
```

**Pagination Response:**
```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Authentication Headers

Protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Language Support

Include language preference in requests:

```
Accept-Language: ar
// or
?lang=ar
```

---

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis (for session management)
- Supabase account (for file storage)

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
DIRECT_URL="postgresql://user:password@localhost:5432/dbname"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Resend (alternative email service)
RESEND_API_KEY="your-resend-api-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Application
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3000"
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd back
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   npm run seedSlideShow
   npm run seedAnalytic
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Run i18n seed script
- `npm run seed2` - Run image fix seed
- `npm run seedSlideShow` - Seed slideshow data
- `npm run seedAnalytic` - Seed analytics data
- `npm run lint` - Run ESLint

### Database Management

#### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

#### Reset Database
```bash
npx prisma migrate reset
```

#### View Database
```bash
npx prisma studio
```

### Deployment Considerations

1. **Environment Variables**: Set all production environment variables
2. **Database**: Use a production PostgreSQL instance
3. **Redis**: Configure production Redis instance
4. **File Storage**: Configure Supabase buckets with proper CORS
5. **Security**: 
   - Enable HTTPS
   - Set secure cookie flags
   - Configure CORS properly
   - Use strong JWT secrets
   - Enable rate limiting
6. **Performance**:
   - Enable database connection pooling
   - Configure Redis cache
   - Optimize image sizes
   - Enable compression

---

## Security Features

### Authentication
- JWT-based authentication with refresh tokens
- Bcrypt password hashing
- 2FA support
- Device verification
- Session management with Redis
- Google OAuth integration

### Data Protection
- IP address hashing for privacy compliance
- Secure session tokens
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Prisma

### File Upload Security
- File type validation
- File size limits
- Hash-based deduplication
- Secure storage with Supabase
- Image optimization and sanitization

---

## Performance Optimizations

### Database
- Indexed fields for common queries
- Composite indexes for multi-field queries
- Optimized relations with proper cascading

### Caching
- Redis session caching
- Static asset caching
- Query result caching potential

### Images
- BlurHash for progressive loading
- Sharp image optimization
- Responsive image serving
- Cloud CDN delivery via Supabase

### Analytics
- Aggregated daily analytics
- Efficient session tracking
- Indexed timestamp fields

---

## Best Practices

### Code Organization
- TypeScript for type safety
- Modular architecture
- Separation of concerns
- RESTful API design

### Database
- Use migrations for schema changes
- Seed files for development data
- Proper indexing strategy
- Cascade deletes for related data

### Security
- Never commit `.env` files
- Use environment variables
- Validate all inputs
- Hash sensitive data
- Implement rate limiting

### Internationalization
- Always provide translations
- Use translation models consistently
- Index language fields
- Maintain unique constraints

---

## Future Enhancements

Potential features to consider:

1. **Advanced Analytics**
   - Real-time visitor tracking
   - Conversion funnel analysis
   - A/B testing framework
   - Heat map tracking

2. **Content Management**
   - Visual page builder
   - Content versioning
   - Draft/preview system
   - Scheduled publishing

3. **SEO**
   - Sitemap generation
   - robots.txt management
   - Schema.org structured data
   - Open Graph tags

4. **Social Features**
   - Blog comments
   - Social sharing
   - Newsletter integration
   - RSS feeds

5. **Performance**
   - GraphQL API
   - Server-side rendering
   - Static site generation
   - Edge caching

6. **Additional Languages**
   - Extend beyond EN/AR
   - RTL support improvements
   - Locale-specific formatting

---

## Support & Maintenance

### Monitoring
- Track error logs
- Monitor database performance
- Check API response times
- Review analytics data

### Backups
- Regular database backups
- Media file backups
- Environment configuration backups

### Updates
- Keep dependencies updated
- Review security advisories
- Test migrations before deployment
- Document all changes

---

## License

[Your License Here]

## Contributors

[Your Team/Contributors Here]

---

**Last Updated**: February 2026
**Version**: 1.0.0