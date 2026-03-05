# System Build Prompt: Internal Company Digital Business Card System

## Project Overview
Build an internal company digital business card system using Next.js 14+, Prisma ORM, PostgreSQL, and Tailwind CSS. This is an internal tool for company employees to create and share professional digital profiles with NFC card integration, QR codes, and analytics. **This is NOT a public SaaS platform** - it's for internal company use only.

---

## Technology Stack Requirements

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v3+
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context API / Zustand
- **Charts:** Recharts for analytics
- **QR Codes:** qrcode.react
- **File Upload:** react-dropzone

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes / Server Actions
- **ORM:** Prisma
- **Database:** PostgreSQL 14+
- **Authentication:** NextAuth.js v5 (Auth.js) with SSO support
- **File Storage:** AWS S3 / Internal storage server
- **Email:** Company SMTP / Resend / SendGrid

### Additional Libraries
- **vCard Generation:** vcf
- **Image Processing:** sharp
- **Analytics:** Custom implementation
- **Rate Limiting:** @upstash/ratelimit (optional)

---

## Core Features to Implement

### Phase 1: Essential Features

#### 1. Authentication & Authorization
```
- SSO integration (Azure AD / Okta / Google Workspace)
- Email/password login (fallback)
- Role-based access control (Admin, Manager, Employee)
- Email verification
- Password reset flow
- Protected routes
- Session management
```

#### 2. Employee Profile Management
```
- Create/edit digital profile
- Upload profile photo and cover image
- Add personal information (name, job title, department)
- Company-specific fields (employee ID, office location, direct manager)
- Manage contact methods (work phone, email, office address)
- Add professional social links (LinkedIn, GitHub, company blog)
- Add custom links (calendly, portfolio, projects)
- Drag-and-drop reordering of links
- Toggle visibility for individual fields
```

#### 3. Profile Sharing
```
- Unique username-based URLs (cards.company.com/username)
- QR code generation (downloadable as PNG/SVG)
- vCard generation and download (.vcf file)
- Share button with native Web Share API
- Direct link copying
- NFC card activation flow
```

#### 4. Employee Directory
```
- Searchable company directory
- Filter by department, location, job title
- Quick contact access
- Department views
- Organizational chart integration (optional)
```

#### 5. Analytics Dashboard
```
- Profile view tracking
- Link click tracking
- Most viewed profiles
- Department analytics
- Device type breakdown
- Internal referrer tracking
```

#### 6. Admin Dashboard
```
- User management (activate/deactivate employees)
- NFC card inventory and assignment
- Bulk employee import (CSV)
- Company branding settings
- Analytics overview
- Department management
- Template management
```

#### 7. NFC Card Management
```
- Card activation page
- Link card to employee profile
- Bulk card assignment
- Card inventory tracking
- Lost/stolen card deactivation
```

---

## Database Schema (Prisma)

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTHENTICATION & USERS
// ============================================

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  image             String?
  password          String?   // hashed password
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Company info
  role              UserRole  @default(EMPLOYEE)
  department        String?
  employeeId        String?   @unique
  isActive          Boolean   @default(true)
  officeLocation    String?
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  profile           Profile?
  nfcCards          NfcCard[]
  adminLogs         AdminLog[]
  
  @@index([email])
  @@index([employeeId])
  @@map("users")
}

enum UserRole {
  EMPLOYEE
  MANAGER
  ADMIN
}

// NextAuth models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================
// PROFILE & CONTENT
// ============================================

model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  username        String   @unique
  
  // Personal info
  firstName       String?
  lastName        String?
  jobTitle        String?
  bio             String?
  
  // Company-specific fields
  department      String?
  officeLocation  String?
  employeeId      String?
  directManager   String?
  teamName        String?
  extension       String?   // Phone extension
  
  // Media
  profilePhotoUrl String?
  coverPhotoUrl   String?
  
  // Customization
  theme           String   @default("company")
  customColors    Json?    // Limited to company brand colors
  layoutSettings  Json?
  
  // Settings
  isActive        Boolean  @default(true)
  isPublic        Boolean  @default(true)  // Public within company
  showInDirectory Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  contactMethods  ContactMethod[]
  socialLinks     SocialLink[]
  customLinks     CustomLink[]
  documents       Document[]
  views           ProfileView[]
  nfcCards        NfcCard[]
  
  @@index([username])
  @@index([department])
  @@index([isActive])
  @@map("profiles")
}

model ContactMethod {
  id          String   @id @default(cuid())
  profileId   String
  
  type        ContactType
  label       String?   // "Work", "Mobile", "Office", etc.
  value       String
  isPrimary   Boolean  @default(false)
  isVisible   Boolean  @default(true)
  displayOrder Int     @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@index([profileId])
  @@map("contact_methods")
}

enum ContactType {
  PHONE
  EMAIL
  ADDRESS
  WEBSITE
  EXTENSION
}

model SocialLink {
  id           String   @id @default(cuid())
  profileId    String
  
  platform     String   // "linkedin", "github", "twitter", etc.
  url          String
  displayOrder Int      @default(0)
  isVisible    Boolean  @default(true)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  profile      Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  clicks       LinkClick[]
  
  @@index([profileId])
  @@map("social_links")
}

model CustomLink {
  id           String   @id @default(cuid())
  profileId    String
  
  title        String
  url          String
  description  String?
  icon         String?
  displayOrder Int      @default(0)
  isVisible    Boolean  @default(true)
  clickCount   Int      @default(0)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  profile      Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  clicks       LinkClick[]
  
  @@index([profileId])
  @@map("custom_links")
}

model Document {
  id          String   @id @default(cuid())
  profileId   String
  
  title       String
  fileUrl     String
  fileType    String   // "pdf", "doc", etc.
  fileSize    Int      // in bytes
  
  createdAt   DateTime @default(now())
  
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@index([profileId])
  @@map("documents")
}

// ============================================
// NFC CARDS
// ============================================

model NfcCard {
  id              String   @id @default(cuid())
  cardUid         String   @unique
  activationCode  String   @unique
  
  userId          String?
  profileId       String?
  
  cardType        String?  // "pvc", "metal", "keychain"
  isActivated     Boolean  @default(false)
  isLocked        Boolean  @default(false)
  isDeactivated   Boolean  @default(false)
  
  // Inventory tracking
  assignedTo      String?  // Employee name/ID
  assignedAt      DateTime?
  notes           String?
  
  activatedAt     DateTime?
  createdAt       DateTime @default(now())
  
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  profile         Profile? @relation(fields: [profileId], references: [id], onDelete: SetNull)
  
  @@index([cardUid])
  @@index([activationCode])
  @@index([isActivated])
  @@map("nfc_cards")
}

// ============================================
// ANALYTICS
// ============================================

model ProfileView {
  id          String   @id @default(cuid())
  profileId   String
  
  // Visitor info
  visitorId   String?  // Logged-in user ID if authenticated
  sessionId   String?
  ipAddress   String?
  userAgent   String?
  
  // Source tracking
  referrer    String?
  sourceType  SourceType?
  
  // Device
  deviceType  String?  // "mobile", "desktop", "tablet"
  browser     String?
  os          String?
  
  viewedAt    DateTime @default(now())
  
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@index([profileId])
  @@index([viewedAt])
  @@map("profile_views")
}

enum SourceType {
  QR
  NFC
  LINK
  DIRECTORY
  DIRECT
}

model LinkClick {
  id            String   @id @default(cuid())
  profileId     String   // Denormalized for easier queries
  
  linkType      LinkType
  socialLinkId  String?
  customLinkId  String?
  
  ipAddress     String?
  userAgent     String?
  
  clickedAt     DateTime @default(now())
  
  socialLink    SocialLink? @relation(fields: [socialLinkId], references: [id], onDelete: Cascade)
  customLink    CustomLink? @relation(fields: [customLinkId], references: [id], onDelete: Cascade)
  
  @@index([profileId])
  @@index([clickedAt])
  @@map("link_clicks")
}

enum LinkType {
  SOCIAL
  CUSTOM
  CONTACT
  DOCUMENT
}

// ============================================
// COMPANY SETTINGS
// ============================================

model CompanySettings {
  id                String   @id @default(cuid())
  
  // Branding
  companyName       String
  logoUrl           String?
  primaryColor      String   @default("#3B82F6")
  secondaryColor    String   @default("#1E40AF")
  
  // Default settings
  defaultTheme      String   @default("company")
  allowCustomThemes Boolean  @default(false)
  
  // Features
  enableDirectory   Boolean  @default(true)
  enableAnalytics   Boolean  @default(true)
  requireApproval   Boolean  @default(false)  // Require admin approval for new profiles
  
  updatedAt         DateTime @updatedAt
  
  @@map("company_settings")
}

model Department {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  managerId   String?
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("departments")
}

// ============================================
// ADMIN LOGS
// ============================================

model AdminLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // "CREATED_USER", "ASSIGNED_CARD", "DEACTIVATED_PROFILE", etc.
  targetId    String?  // ID of affected resource
  details     Json?
  
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@map("admin_logs")
}
```

---

## Project Structure

```
company-digital-cards/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── sso-callback/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Employee dashboard
│   │   │   ├── edit-profile/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── page.tsx              # Admin overview
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # User management
│   │   │   ├── cards/
│   │   │   │   └── page.tsx          # NFC card management
│   │   │   ├── departments/
│   │   │   │   └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx          # Company-wide analytics
│   │   │   ├── branding/
│   │   │   │   └── page.tsx          # Brand settings
│   │   │   └── bulk-import/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── directory/
│   │   │   └── page.tsx              # Employee directory
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx          # Public profile
│   │   └── n/
│   │       └── [cardUid]/
│   │           └── page.tsx          # NFC handler
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── profile/
│   │   │   ├── route.ts
│   │   │   └── [username]/
│   │   │       └── route.ts
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   └── route.ts
│   │   │   ├── cards/
│   │   │   │   └── route.ts
│   │   │   └── bulk-import/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   ├── vcard/
│   │   │   └── [username]/
│   │   │       └── route.ts
│   │   ├── qr/
│   │   │   └── [username]/
│   │   │       └── route.ts
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   └── directory/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx                      # Landing/login page
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui
│   ├── profile/
│   │   ├── profile-header.tsx
│   │   ├── contact-section.tsx
│   │   ├── social-links.tsx
│   │   └── custom-links.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── stats-card.tsx
│   │   └── analytics-chart.tsx
│   ├── admin/
│   │   ├── user-table.tsx
│   │   ├── card-inventory.tsx
│   │   ├── bulk-import-form.tsx
│   │   └── department-manager.tsx
│   ├── directory/
│   │   ├── employee-card.tsx
│   │   ├── search-filters.tsx
│   │   └── department-grid.tsx
│   └── forms/
│       ├── profile-form.tsx
│       └── contact-form.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts                       # SSO config
│   ├── utils.ts
│   ├── validations/
│   ├── api/
│   └── hooks/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Implementation Instructions

### Step 1: Project Setup

```bash
# Create Next.js app
npx create-next-app@latest company-digital-cards --typescript --tailwind --app

cd company-digital-cards

# Install dependencies
npm install prisma @prisma/client
npm install next-auth@beta
npm install zod react-hook-form @hookform/resolvers
npm install qrcode vcf sharp bcryptjs
npm install recharts lucide-react
npm install react-dropzone date-fns
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge

# Dev dependencies
npm install -D @types/qrcode @types/bcryptjs

# Initialize Prisma
npx prisma init
```

### Step 2: Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/companydigitalcards?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# SSO (Azure AD example)
AZURE_AD_CLIENT_ID="your-azure-ad-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-ad-client-secret"
AZURE_AD_TENANT_ID="your-tenant-id"

# OR Google Workspace
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_HD="yourcompany.com"  # Restrict to company domain

# Email
SMTP_HOST="smtp.company.com"
SMTP_PORT="587"
SMTP_USER="noreply@company.com"
SMTP_PASSWORD="your-smtp-password"
EMAIL_FROM="noreply@company.com"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="company-employee-cards"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="Your Company Name"
```

### Step 3: Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed initial data (admin user, company settings)
npx prisma db seed
```

### Step 4: SSO Configuration

Create `lib/auth.ts`:

```typescript
import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Azure AD (Office 365)
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    
    // OR Google Workspace
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: process.env.GOOGLE_HD, // Restrict to company domain
        },
      },
    }),
    
    // Fallback: Email/Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Verify user email domain for SSO
      if (account?.provider === "google" || account?.provider === "azure-ad") {
        const email = user.email || profile?.email;
        const companyDomain = process.env.GOOGLE_HD || process.env.COMPANY_DOMAIN;
        
        if (!email?.endsWith(`@${companyDomain}`)) {
          return false; // Reject non-company emails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};
```

---

## Key Components to Build

### A. Employee Directory

```typescript
// app/(public)/directory/page.tsx

import { prisma } from "@/lib/prisma";
import EmployeeCard from "@/components/directory/employee-card";
import SearchFilters from "@/components/directory/search-filters";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { search?: string; department?: string };
}) {
  const profiles = await prisma.profile.findMany({
    where: {
      isActive: true,
      showInDirectory: true,
      ...(searchParams.search && {
        OR: [
          { firstName: { contains: searchParams.search, mode: "insensitive" } },
          { lastName: { contains: searchParams.search, mode: "insensitive" } },
          { jobTitle: { contains: searchParams.search, mode: "insensitive" } },
        ],
      }),
      ...(searchParams.department && {
        department: searchParams.department,
      }),
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Employee Directory</h1>
      
      <SearchFilters departments={departments} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {profiles.map((profile) => (
          <EmployeeCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
```

### B. Admin User Management

```typescript
// app/(admin)/admin/users/page.tsx

import { prisma } from "@/lib/prisma";
import UserTable from "@/components/admin/user-table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      profile: {
        select: {
          username: true,
          department: true,
        },
      },
      nfcCards: {
        where: { isActivated: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    withCards: users.filter((u) => u.nfcCards.length > 0).length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600 mt-2">Manage employee accounts and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.withCards}</div>
          <div className="text-sm text-gray-600">With NFC Cards</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          <div className="text-sm text-gray-600">Administrators</div>
        </div>
      </div>

      <UserTable users={users} />
    </div>
  );
}
```

### C. Bulk Employee Import

```typescript
// app/api/admin/bulk-import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const csvText = await file.text();
  
  // Expected CSV format:
  // email,firstName,lastName,jobTitle,department,employeeId
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  const results = {
    created: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const record of records) {
    try {
      // Generate random password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: record.email,
          name: `${record.firstName} ${record.lastName}`,
          password: hashedPassword,
          department: record.department,
          employeeId: record.employeeId,
          role: "EMPLOYEE",
          isActive: true,
        },
      });

      // Create profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          username: record.email.split("@")[0], // Use email prefix as username
          firstName: record.firstName,
          lastName: record.lastName,
          jobTitle: record.jobTitle,
          department: record.department,
          employeeId: record.employeeId,
        },
      });

      // TODO: Send welcome email with temp password

      results.created++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`${record.email}: ${error.message}`);
    }
  }

  return NextResponse.json(results);
}
```

### D. NFC Card Assignment

```typescript
// app/api/admin/cards/assign/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId, userId, profileId } = await request.json();

  const card = await prisma.nfcCard.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (card.isActivated) {
    return NextResponse.json(
      { error: "Card is already activated" },
      { status: 400 }
    );
  }

  const updatedCard = await prisma.nfcCard.update({
    where: { id: cardId },
    data: {
      userId,
      profileId,
      assignedTo: userId,
      assignedAt: new Date(),
    },
  });

  // Log admin action
  await prisma.adminLog.create({
    data: {
      userId: session.user.id,
      action: "ASSIGNED_CARD",
      targetId: cardId,
      details: { userId, profileId },
    },
  });

  return NextResponse.json(updatedCard);
}
```

---

## Admin Features Implementation

### 1. Company Branding Settings

```typescript
// app/(admin)/admin/branding/page.tsx

import BrandingForm from "@/components/admin/branding-form";
import { prisma } from "@/lib/prisma";

export default async function BrandingPage() {
  const settings = await prisma.companySettings.findFirst();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Company Branding</h1>
      <BrandingForm initialData={settings} />
    </div>
  );
}
```

### 2. Analytics Dashboard (Company-wide)

```typescript
// app/(admin)/admin/analytics/page.tsx

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import ViewsChart from "@/components/admin/views-chart";

export default async function AdminAnalyticsPage() {
  const totalViews = await prisma.profileView.count();
  const totalProfiles = await prisma.profile.count({ where: { isActive: true } });
  const totalCards = await prisma.nfcCard.count({ where: { isActivated: true } });

  // Most viewed profiles
  const topProfiles = await prisma.profile.findMany({
    include: {
      _count: {
        select: { views: true },
      },
    },
    orderBy: {
      views: {
        _count: "desc",
      },
    },
    take: 10,
  });

  // Department breakdown
  const departmentStats = await prisma.profile.groupBy({
    by: ["department"],
    _count: true,
    where: { isActive: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Company Analytics</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-3xl font-bold">{totalProfiles}</div>
          <div className="text-gray-600">Active Profiles</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold">{totalViews}</div>
          <div className="text-gray-600">Total Views</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold">{totalCards}</div>
          <div className="text-gray-600">Active Cards</div>
        </Card>
      </div>

      <ViewsChart />

      {/* More analytics components... */}
    </div>
  );
}
```

---

## Development Roadmap

### Week 1-2: Foundation
- [ ] Project setup (Next.js, Prisma, PostgreSQL)
- [ ] Database schema implementation
- [ ] SSO authentication setup
- [ ] Basic UI components (shadcn/ui)
- [ ] Admin role middleware

### Week 3-4: Core Employee Features
- [ ] User registration/login
- [ ] Profile creation and editing
- [ ] Image upload
- [ ] Contact methods CRUD
- [ ] Social and custom links
- [ ] Public profile page

### Week 5-6: Directory & Sharing
- [ ] Employee directory with search/filters
- [ ] QR code generation
- [ ] vCard download
- [ ] Share functionality
- [ ] Department organization

### Week 7-8: Admin Dashboard
- [ ] User management interface
- [ ] NFC card inventory
- [ ] Bulk employee import (CSV)
- [ ] Company branding settings
- [ ] Department management

### Week 9-10: Analytics & Polish
- [ ] Profile view tracking
- [ ] Link click tracking
- [ ] Analytics dashboards (employee & admin)
- [ ] NFC card activation flow
- [ ] Mobile responsive design
- [ ] Testing and bug fixes

---

## Security Checklist

- [ ] SSO enforced (restrict to company domain)
- [ ] Role-based access control (Admin/Manager/Employee)
- [ ] Input sanitization and validation
- [ ] File upload restrictions (type, size)
- [ ] Rate limiting on sensitive endpoints
- [ ] SQL injection protection (Prisma)
- [ ] XSS prevention (React)
- [ ] HTTPS only in production
- [ ] Secure password hashing (bcrypt)
- [ ] Session management
- [ ] CSRF protection
- [ ] Admin action logging

---

## Deployment Guide

### Internal Hosting Options

1. **On-Premises Server**
   - Deploy to company's internal servers
   - Use company's PostgreSQL instance
   - Configure reverse proxy (nginx)

2. **Cloud (Private)**
   - AWS VPC / Azure Private Network
   - Restrict access to company IP ranges
   - Use managed PostgreSQL (RDS/Azure DB)

3. **Containerized (Docker)**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   RUN npx prisma generate
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

### Environment Setup

```bash
# Production database migration
DATABASE_URL="production-db-url" npx prisma migrate deploy

# Build for production
npm run build

# Start production server
npm start
```

---

## Success Criteria

✅ Employees can log in via SSO  
✅ Profiles are created and editable  
✅ Employee directory is searchable  
✅ QR codes and vCards work correctly  
✅ NFC cards activate and link to profiles  
✅ Admins can manage users and cards  
✅ Bulk import works for onboarding  
✅ Analytics track engagement  
✅ Mobile responsive design  
✅ Company branding applied consistently  

---

## Additional Features (Future)

### Phase 2 Enhancements
- **Org Chart Integration** - Visual hierarchy
- **Meeting Room Booking** - QR codes in conference rooms
- **Visitor Management** - Temporary visitor cards
- **Asset Tracking** - NFC tags for equipment
- **Access Control Integration** - Badge system sync
- **Microsoft Teams Integration** - Quick dial
- **Slack Integration** - Profile lookup bot
- **Mobile App** - Native iOS/Android app
- **Offline Mode** - Cache profiles locally
- **Multi-language Support** - i18n for global teams

---

## Notes for Implementation

1. **Start with SSO** - Authentication is critical for internal systems
2. **Admin portal first** - Admins need to set up before employees use it
3. **Bulk import early** - Essential for rolling out to entire company
4. **Mobile-first** - Most profile views will be on phones
5. **Company branding** - Consistent look aligned with company brand
6. **Privacy controls** - Employees should control their visibility
7. **Keep it simple** - Internal tools should be intuitive
8. **Performance** - Optimize for hundreds/thousands of employees
9. **Audit logging** - Track admin actions for compliance
10. **Documentation** - Write guides for employees and admins

Good luck building! 🚀
