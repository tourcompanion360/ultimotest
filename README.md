# TourCompanion SaaS Platform

A comprehensive multi-tenant SaaS platform for virtual tour creators and their clients.

## 🚀 Live Application

**Production URL:** https://dashboardtourcreators.netlify.app

## 📚 Documentation

Complete documentation is available in the [`docs/`](./docs/) folder:

### 🚀 Getting Started
- **[⚡ Quick Start Guide](./docs/QUICK_START.md)** - Get up and running in 5 minutes
- **[👨‍💻 Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Complete setup and development workflow

### 📖 Core Documentation
- **[📋 Documentation Index](./docs/README.md)** - Start here for an overview
- **[🏗️ Architecture](./docs/ARCHITECTURE.md)** - System design and data flow
- **[🗄️ Database](./docs/DATABASE.md)** - Schema, RLS policies, and migrations
- **[🧩 Components](./docs/COMPONENTS.md)** - Component structure and usage examples
- **[🔌 API](./docs/API.md)** - Edge functions and frontend API examples

### 🔧 Technical Documentation
- **[🚀 Deployment](./docs/DEPLOYMENT.md)** - Build and deployment process
- **[🐛 Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[📝 Changelog](./docs/CHANGELOG.md)** - Version history and changes

## 🎯 Quick Start

### For Developers
1. **Read the [Architecture Overview](./docs/ARCHITECTURE.md)**
2. **Follow the [Developer Guide](./docs/DEVELOPER_GUIDE.md)**
3. **Understand the [Database Schema](./docs/DATABASE.md)**
4. **Explore [Key Components](./docs/COMPONENTS.md)**

### For Users
- **Tour Creators:** Access the creator dashboard to manage projects and clients
- **End Clients:** Use the client portal to view your project data and analytics

## 🏗️ System Overview

TourCompanion is a multi-tenant SaaS platform serving two user types:

- **Tour Creators/Agencies** - Paying customers who manage multiple client projects
- **End Clients** - Clients of tour creators who receive branded portals

### Key Features
- **Multi-tenant Architecture** - Single database, multiple isolated views
- **Real-time Data Flow** - Live updates between creator dashboard and client portals
- **Row-Level Security** - Database-level data isolation and security
- **Chatbot Integration** - AI-powered lead capture and customer support
- **Analytics Dashboard** - Comprehensive metrics and insights
- **File Management** - Organized asset library for all projects

## 🛠️ Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **UI:** Tailwind CSS + Shadcn/UI
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Deployment:** Netlify
- **Database:** PostgreSQL with Row-Level Security

## 🚀 Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- Supabase account

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# (Optional) Load sample data for testing
# Run the seed.sql file in your Supabase SQL editor

# Start development server
npm run dev
```

### Environment Variables
The `.env.example` file contains all required environment variables with detailed setup instructions:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# Optional: For local development
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Sample Data
For testing and development, use the provided seed data:
- **File**: `supabase/seed.sql`
- **Contains**: Sample creators, clients, projects, chatbots, analytics, leads, requests, and assets
- **Usage**: Run in Supabase SQL editor to populate your database with test data

## 📊 Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tour Creator  │    │   Supabase DB   │    │   End Client    │
│   Dashboard     │◄──►│   (Multi-tenant)│◄──►│   Portal        │
│                 │    │                 │    │                 │
│ • Project Mgmt  │    │ • RLS Policies  │    │ • View Analytics│
│ • Client Mgmt   │    │ • Real-time     │    │ • View Leads    │
│ • Chatbot Mgmt  │    │ • Auth System   │    │ • Submit Requests│
│ • Analytics     │    │ • Edge Functions│    │ • View Media    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Data Flow

1. **Creator** creates projects and chatbots for clients
2. **End Clients** access their branded portals
3. **Visitors** interact with virtual tours and chatbots
4. **Leads** are captured and appear in both dashboards
5. **Real-time updates** sync data across all interfaces

## 📈 Key Metrics

- **8 Core Database Tables** with proper relationships
- **Row-Level Security** for multi-tenant data isolation
- **Real-time Subscriptions** for live data updates
- **Mobile-First Design** for all devices
- **PWA Support** for app installation

## 🔐 Security Features

- **Database-Level Security** with Row-Level Security (RLS)
- **JWT Authentication** for secure user sessions
- **CORS Configuration** for proper cross-origin resource sharing
- **Input Validation** and sanitization
- **HTTPS Enforcement** for secure data transmission

## 🚀 Deployment

The application is automatically deployed to Netlify on every push to the main branch.

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment:** Production-ready with proper error handling

## 📝 Contributing

When making changes:

1. **Update relevant documentation** in the `docs/` folder
2. **Add entries to [CHANGELOG.md](./docs/CHANGELOG.md)**
3. **Test all functionality** thoroughly
4. **Follow the [Developer Guide](./docs/DEVELOPER_GUIDE.md)**

## 🆘 Getting Help

- **Check [Troubleshooting](./docs/TROUBLESHOOTING.md)** for common issues
- **Review [API Documentation](./docs/API.md)** for backend functionality
- **Consult [Component Documentation](./docs/COMPONENTS.md)** for frontend structure
- **Check [Changelog](./docs/CHANGELOG.md)** for recent changes

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated:** January 11, 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team

For complete documentation, visit the [`docs/`](./docs/) folder.
