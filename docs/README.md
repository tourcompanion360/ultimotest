# TourCompanion SaaS Documentation

Welcome to the TourCompanion SaaS platform documentation. This comprehensive guide will help you understand, develop, and maintain the multi-tenant virtual tour and chatbot platform.

## 📚 Documentation Index

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Complete setup and development workflow

### Core Documentation
- **[Architecture](ARCHITECTURE.md)** - System design, data flow, and multi-tenant architecture
- **[Database](DATABASE.md)** - Complete schema, RLS policies, and migrations
- **[Components](COMPONENTS.md)** - Component structure, props, and usage examples
- **[API](API.md)** - Edge functions, integrations, and frontend API examples

### Technical Documentation
- **[Deployment](DEPLOYMENT.md)** - Build process, environment setup, and production deployment
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues, solutions, and debugging guides

### Project Management
- **[Changelog](CHANGELOG.md)** - Version history, features, and breaking changes

## 🚀 Quick Start

### For New Developers
1. Read the [Architecture Overview](ARCHITECTURE.md#application-overview)
2. Follow the [Developer Guide](DEVELOPER_GUIDE.md#prerequisites--setup)
3. Understand the [Database Schema](DATABASE.md#core-tables)
4. Explore [Key Components](COMPONENTS.md#component-hierarchy)

### For System Understanding
1. Start with [Architecture](ARCHITECTURE.md) for system overview
2. Review [Database](DATABASE.md) for data structure
3. Check [API](API.md) for backend functionality
4. Reference [Components](COMPONENTS.md) for frontend structure

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

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **UI**: Tailwind CSS + Shadcn/UI
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Netlify
- **Database**: PostgreSQL with Row-Level Security

## 📝 Contributing

When making changes to the system:

1. Update relevant documentation files
2. Add entries to [CHANGELOG.md](CHANGELOG.md)
3. Test all functionality
4. Update this README if needed

## 🆘 Getting Help

- Check [Troubleshooting](TROUBLESHOOTING.md) for common issues
- Review [API](API.md) for backend functionality
- Consult [Components](COMPONENTS.md) for frontend structure
- Check [Changelog](CHANGELOG.md) for recent changes

---

**Last Updated**: January 11, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
