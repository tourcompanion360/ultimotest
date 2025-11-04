# 🔗 Chatbot Management Integration Guide

This guide explains how to integrate the Chatbot Management system into your existing React application.

## 📋 **Prerequisites**

Ensure you have the following dependencies installed:
```bash
npm install zod @hookform/resolvers
```

## 🚀 **Quick Integration**

### **1. Add to Navigation**

Update your `Layout.tsx` to include the chatbot management:

```typescript
// In src/components/Layout.tsx
const navigationItems = [
  // ... existing items
  {
    id: 'chatbot-management',
    label: 'Chatbot Management',
    icon: Bot
  },
  // ... rest of items
];
```

### **2. Add Route**

Update your routing configuration:

```typescript
// In your main App component or router
import ChatbotManagement from '@/components/ChatbotManagement';

// Add route
<Route path="/chatbot-management" element={<ChatbotManagement />} />
```

### **3. Update Text Constants**

The chatbot text constants are already added to `src/constants/text.ts`. No additional setup required.

## 🗄️ **Database Setup**

### **Supabase Table Creation**

Create the `chatbots` table in your Supabase database:

```sql
-- Create chatbots table
CREATE TABLE chatbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'english',
  welcome_message TEXT NOT NULL,
  fallback_message TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  widget_style TEXT NOT NULL DEFAULT 'modern',
  position TEXT NOT NULL DEFAULT 'bottom_right',
  avatar_url TEXT,
  brand_logo_url TEXT,
  knowledge_base_text TEXT,
  uploaded_files TEXT[] DEFAULT '{}',
  response_style TEXT NOT NULL DEFAULT 'friendly',
  max_questions INTEGER NOT NULL DEFAULT 10,
  conversation_limit INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'draft',
  statistics JSONB DEFAULT '{
    "total_conversations": 0,
    "active_users": 0,
    "avg_response_time": 0,
    "satisfaction_rate": 0,
    "total_messages": 0,
    "last_activity": ""
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_chatbots_user_id ON chatbots(user_id);
CREATE INDEX idx_chatbots_status ON chatbots(status);
CREATE INDEX idx_chatbots_created_at ON chatbots(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for anonymous users
CREATE POLICY "Allow anonymous access to chatbots" ON chatbots
  FOR ALL USING (user_id = 'anonymous');
```

### **Storage Bucket Setup**

Create a storage bucket for chatbot files:

```sql
-- Create storage bucket for chatbot files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chatbot-files', 'chatbot-files', true);

-- Create storage policy
CREATE POLICY "Allow anonymous uploads to chatbot-files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chatbot-files');

CREATE POLICY "Allow anonymous downloads from chatbot-files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chatbot-files');
```

## 🎨 **Styling Integration**

### **CSS Classes**

The component uses existing Tailwind classes and follows your design system:

```css
/* No additional CSS required - uses existing design tokens */
```

### **Theme Integration**

The component automatically respects your light/dark theme settings.

## 🔧 **Configuration Options**

### **Environment Variables**

Add these to your `.env` file:

```env
# Chatbot Configuration
VITE_MAX_CHATBOTS=5
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=text/plain,application/pdf,text/markdown,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### **Customization**

You can customize the chatbot management by modifying:

1. **Text Constants** - Update `src/constants/text.ts`
2. **Validation Rules** - Modify `src/validators/chatbot.ts`
3. **API Service** - Customize `src/services/chatbotApi.ts`
4. **UI Components** - Extend the main component

## 📱 **Mobile Responsiveness**

The component is fully responsive and works on:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

## 🔒 **Security Considerations**

### **File Upload Security**
- File type validation
- File size limits
- Secure file storage
- XSS protection

### **Data Validation**
- Zod schema validation
- Input sanitization
- SQL injection prevention

## 🧪 **Testing**

### **Component Testing**
```bash
# Run component tests
npm run test src/components/ChatbotManagement.test.tsx
```

### **Integration Testing**
```bash
# Run integration tests
npm run test src/services/chatbotApi.test.ts
```

## 🚀 **Deployment**

### **Build Process**
```bash
# Build for production
npm run build

# The chatbot management will be included in the build
```

### **Environment Setup**
Ensure your production environment has:
- Supabase database with chatbots table
- Storage bucket for file uploads
- Proper RLS policies

## 📊 **Analytics Integration**

### **Track Usage**
```typescript
// Add analytics tracking
const trackChatbotAction = (action: string, chatbotId: string) => {
  // Your analytics implementation
  analytics.track('chatbot_action', {
    action,
    chatbot_id: chatbotId,
    timestamp: new Date().toISOString()
  });
};
```

## 🔄 **Updates and Maintenance**

### **Version Updates**
- Keep dependencies updated
- Monitor for security updates
- Test after updates

### **Database Migrations**
- Use Supabase migrations for schema changes
- Test migrations in staging first
- Backup before major changes

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Build Errors**
   - Check TypeScript types
   - Verify all imports
   - Run `npm run build` to identify issues

2. **Database Errors**
   - Verify table exists
   - Check RLS policies
   - Test database connection

3. **File Upload Issues**
   - Check storage bucket permissions
   - Verify file size limits
   - Test file type validation

### **Debug Mode**
```typescript
// Enable debug logging
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

if (DEBUG) {
  console.log('Chatbot Management Debug Mode');
}
```

## 📞 **Support**

For issues or questions:
1. Check the main README.md
2. Review the component documentation
3. Check console for error messages
4. Verify database setup

---

**Integration Complete! 🎉**

Your chatbot management system is now ready to use.




