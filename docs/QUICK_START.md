# Quick Start Guide

Get up and running with TourCompanion in under 10 minutes!

## 🚀 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Supabase account (free tier works)

## ⚡ 5-Minute Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd dashboard
npm install
```

### 2. Set Up Supabase
1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to Settings → API
4. Copy your Project URL and anon public key

### 3. Configure Environment
```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 4. Set Up Database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/seed.sql`
4. Run the SQL to create tables and sample data

### 5. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` and you're ready to go! 🎉

## 🧪 Testing the Application

### Creator Dashboard
1. The app will load with sample data
2. Navigate through different sections:
   - **Projects**: View and manage virtual tour projects
   - **Clients**: Manage client relationships
   - **Analytics**: View performance metrics
   - **Media Library**: Upload and share assets
   - **Chatbots**: Manage AI assistants

### Client Portal
1. Go to any project in the Projects section
2. Click "Share Portal" to get the client URL
3. Open the client URL in a new tab/incognito window
4. Experience the client-facing dashboard

## 📱 Key Features to Test

### For Tour Creators
- ✅ Create new projects and clients
- ✅ Upload and share media assets
- ✅ View real-time analytics
- ✅ Manage chatbot requests
- ✅ Monitor client activity

### For End Clients
- ✅ View project information
- ✅ Access shared media library
- ✅ Submit change requests
- ✅ View analytics dashboard
- ✅ Mobile-responsive experience

## 🔧 Common Issues

### Environment Variables Not Working
- Make sure `.env.local` is in the root directory
- Restart the development server after changing environment variables
- Check that your Supabase URL and key are correct

### Database Connection Issues
- Verify your Supabase project is active
- Check that RLS policies are enabled
- Ensure the seed data was loaded correctly

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires v18+)
- Clear node_modules and reinstall if needed

## 🎯 Next Steps

### For Development
1. **Read the [Architecture Guide](ARCHITECTURE.md)** - Understand the system design
2. **Explore [Component Examples](COMPONENTS.md)** - Learn how to use components
3. **Check [API Documentation](API.md)** - Understand data flow and endpoints
4. **Review [Database Schema](DATABASE.md)** - Learn about data structure

### For Production
1. **Follow [Deployment Guide](DEPLOYMENT.md)** - Deploy to production
2. **Set up monitoring** - Monitor performance and errors
3. **Configure backups** - Set up database backups
4. **Plan scaling** - Consider performance optimization

## 🆘 Need Help?

- **Check [Troubleshooting](TROUBLESHOOTING.md)** for common issues
- **Review [Developer Guide](DEVELOPER_GUIDE.md)** for detailed setup
- **Consult [API Documentation](API.md)** for integration help
- **Check [Changelog](CHANGELOG.md)** for recent updates

## 🎉 You're All Set!

Your TourCompanion platform is now running with:
- ✅ Complete multi-tenant architecture
- ✅ Real-time data synchronization
- ✅ Mobile-responsive design
- ✅ Sample data for testing
- ✅ Comprehensive documentation

Happy coding! 🚀



