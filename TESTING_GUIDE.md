# Support System Testing Guide

## Prerequisites

Before testing, ensure:
1. ✅ Database migration has been applied
2. ✅ TypeScript types have been regenerated
3. ✅ Application is running (`npm run dev`)

## Test Scenario 1: User Submits Request

### Steps:
1. **Login as a regular user** (not admin)
2. Navigate to **Support** page
3. Click on **Contact** tab
4. Fill out the form:
   - **Subject**: Select "Technical Support"
   - **Priority**: Select "High"
   - **Message**: Type "I need help with creating my first virtual tour project. The upload button is not working."
5. Click **Send Message**

### Expected Results:
- ✅ Success toast appears: "Request Sent"
- ✅ Form clears (subject, priority, message all reset)
- ✅ Request appears in "My Requests" tab
- ✅ Request shows status: "Open"
- ✅ Request shows priority: "High"

### Database Verification:
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM public.support_requests 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC 
LIMIT 1;
```

Should show:
- `subject`: 'technical_support'
- `status`: 'open'
- `priority`: 'high'
- `message`: Your message text
- `admin_response`: NULL
- `created_at`: Recent timestamp

---

## Test Scenario 2: Admin Views Request

### Steps:
1. **Login as admin user**
2. Navigate to **/admin** route
3. Click on **Support Requests** tab

### Expected Results:
- ✅ Statistics cards show correct counts:
  - Open: 1 (or more)
  - In Progress: 0
  - Resolved: 0
  - Urgent: 0
  - Total: 1 (or more)
- ✅ Request list shows the newly created request
- ✅ Request displays:
  - Subject: "Technical Support"
  - User email
  - Creator name (if applicable)
  - Status badge: "open" (yellow)
  - Priority badge: "high" (orange)
  - Created date and time
- ✅ Search box is functional
- ✅ Filter dropdowns work (Status, Priority)

### Database Verification:
```sql
-- Admin should see all requests
SELECT 
  id,
  user_id,
  subject,
  status,
  priority,
  created_at
FROM public.support_requests 
ORDER BY created_at DESC;
```

---

## Test Scenario 3: Admin Responds to Request

### Steps:
1. **Still logged in as admin**
2. In Support Requests tab, **click on the request** from Test 1
3. In the right panel (Request Details):
   - Change **Status** dropdown to "In Progress"
   - In **Response to User** textarea, type: "Thank you for reaching out. We're investigating the upload button issue. Please try clearing your browser cache in the meantime."
   - Click **Save Response**
4. Optionally add **Internal Notes**: "Check if this is related to the file size limit issue reported last week"
5. Click **Save Notes**

### Expected Results:
- ✅ Success toast: "Request Updated"
- ✅ Status badge changes to "in progress" (blue)
- ✅ "Responded" indicator appears (green checkmark)
- ✅ Request details update immediately
- ✅ Statistics update (Open: 0, In Progress: 1)

### Database Verification:
```sql
SELECT 
  id,
  status,
  admin_response,
  admin_notes,
  updated_at
FROM public.support_requests 
WHERE id = 'your-request-id';
```

Should show:
- `status`: 'in_progress'
- `admin_response`: Your response text
- `admin_notes`: Your internal notes
- `updated_at`: Recent timestamp

---

## Test Scenario 4: User Sees Admin Response

### Steps:
1. **Logout from admin account**
2. **Login as the original user** (from Test 1)
3. Navigate to **Support** page
4. Click on **My Requests** tab

### Expected Results:
- ✅ Request shows updated status: "In Progress"
- ✅ Blue box appears with "Admin Response:" header
- ✅ Admin's response text is displayed
- ✅ Internal notes are NOT visible (admin only)
- ✅ Priority still shows "high"

---

## Test Scenario 5: Real-Time Updates

### Setup:
1. Open **two browser windows** side by side
2. Window 1: Login as **user**, go to Support → My Requests
3. Window 2: Login as **admin**, go to Admin Dashboard → Support Requests

### Steps:
1. In **Window 2 (Admin)**:
   - Click on a request
   - Change status to "Resolved"
   - Add response: "Issue fixed! Please try again."
   - Click Save Response

### Expected Results:
- ✅ Window 2 (Admin): Request updates immediately
- ✅ Window 1 (User): Request updates automatically (may take 1-2 seconds)
- ✅ User sees new status: "Resolved"
- ✅ User sees new admin response
- ✅ Green "Resolved" indicator appears

---

## Test Scenario 6: Filtering and Search

### Steps (as Admin):
1. Create **multiple test requests** with different:
   - Statuses (open, in_progress, resolved)
   - Priorities (low, medium, high, urgent)
   - Subjects

2. Test **Status Filter**:
   - Select "Open" → Only open requests show
   - Select "In Progress" → Only in-progress requests show
   - Select "All Status" → All requests show

3. Test **Priority Filter**:
   - Select "Urgent" → Only urgent requests show
   - Select "High" → Only high priority requests show
   - Select "All Priority" → All requests show

4. Test **Search**:
   - Type user email → Matching requests show
   - Type part of message → Matching requests show
   - Type subject keyword → Matching requests show

### Expected Results:
- ✅ Filters work independently
- ✅ Filters can be combined (e.g., "Open" + "High")
- ✅ Search works across all visible fields
- ✅ Request count updates based on filters
- ✅ "No results" state if no matches

---

## Test Scenario 7: Empty States

### Test 7A: User with No Requests
1. Login as a **new user** who hasn't submitted any requests
2. Go to Support → My Requests tab

**Expected:**
- ✅ Empty state card appears
- ✅ Message: "No Support Requests Yet"
- ✅ Helpful text: "Go to the Contact tab to submit your first request"

### Test 7B: Admin with No Selected Request
1. Login as admin
2. Go to Admin Dashboard → Support Requests
3. Don't click on any request

**Expected:**
- ✅ Right panel shows empty state
- ✅ Icon and message: "Select a request to view details"

---

## Test Scenario 8: Priority Levels

### Steps:
Create 4 requests with different priorities:
1. Low priority request
2. Medium priority request
3. High priority request
4. Urgent priority request

### Expected Results:
- ✅ Low: Green badge
- ✅ Medium: Yellow badge
- ✅ High: Orange badge
- ✅ Urgent: Red badge
- ✅ Statistics show correct urgent count
- ✅ Requests can be filtered by priority

---

## Test Scenario 9: Complete Status Flow

### Steps:
1. Create request (Status: **open**)
2. Admin changes to **in_progress**
3. Admin changes to **resolved**
4. Admin changes to **closed**

### Expected Results at Each Step:
- ✅ **Open**: Yellow badge, appears in "Open" filter
- ✅ **In Progress**: Blue badge, appears in "In Progress" filter
- ✅ **Resolved**: Green badge, appears in "Resolved" filter, shows green checkmark
- ✅ **Closed**: Gray badge, appears in "Closed" filter
- ✅ When status changes to "resolved", `resolved_at` timestamp is set
- ✅ When status changes to "resolved", `resolved_by` is set to admin's user_id

---

## Test Scenario 10: Request Types

### Steps:
Create requests with all 8 request types:
1. Technical Support
2. Project Creation
3. Client Portal
4. Chatbot Setup
5. Payment & Billing
6. Account Management
7. Feature Request
8. Other

### Expected Results:
- ✅ Each type displays correct label
- ✅ All types are searchable
- ✅ Request type is stored correctly in database

---

## Common Issues and Solutions

### Issue: TypeScript errors
**Solution**: Run migration and regenerate types

### Issue: "Access denied" when viewing requests
**Solution**: Check RLS policies, ensure user is in admin_users table for admin access

### Issue: Real-time updates not working
**Solution**: 
1. Check Supabase real-time is enabled
2. Verify subscription is active in browser console
3. Check network tab for WebSocket connection

### Issue: Empty request list
**Solution**:
1. Check database has records
2. Verify RLS policies allow access
3. Check console for errors

### Issue: Can't update request
**Solution**:
1. Verify user is admin
2. Check admin_users table
3. Verify RLS UPDATE policy

---

## Database Queries for Debugging

### Check all requests:
```sql
SELECT * FROM public.support_requests ORDER BY created_at DESC;
```

### Check user's requests:
```sql
SELECT * FROM public.support_requests 
WHERE user_id = 'user-uuid-here';
```

### Check admin responses:
```sql
SELECT id, subject, status, admin_response 
FROM public.support_requests 
WHERE admin_response IS NOT NULL;
```

### Check resolved requests:
```sql
SELECT id, subject, status, resolved_by, resolved_at 
FROM public.support_requests 
WHERE status = 'resolved';
```

### Check request counts by status:
```sql
SELECT status, COUNT(*) as count 
FROM public.support_requests 
GROUP BY status;
```

### Check request counts by priority:
```sql
SELECT priority, COUNT(*) as count 
FROM public.support_requests 
GROUP BY priority;
```

---

## Success Criteria

All tests pass when:
- ✅ Users can submit requests
- ✅ Requests appear in database
- ✅ Admins can see all requests
- ✅ Admins can update requests
- ✅ Users can see admin responses
- ✅ Real-time updates work
- ✅ Filters and search work
- ✅ Statistics are accurate
- ✅ RLS policies enforce security
- ✅ Empty states display correctly

---

## Performance Checks

- ✅ Request list loads in < 2 seconds
- ✅ Search results appear instantly
- ✅ Filter changes are immediate
- ✅ Real-time updates arrive within 2 seconds
- ✅ No console errors
- ✅ No memory leaks (check browser dev tools)

---

## Final Verification

Run this SQL to verify everything is connected:
```sql
-- This should return data from the same table both interfaces use
SELECT 
  'Total Requests' as metric,
  COUNT(*) as value
FROM public.support_requests
UNION ALL
SELECT 
  'Open Requests',
  COUNT(*)
FROM public.support_requests
WHERE status = 'open'
UNION ALL
SELECT 
  'With Admin Response',
  COUNT(*)
FROM public.support_requests
WHERE admin_response IS NOT NULL;
```

If you see data here, both the user interface and admin panel are successfully connected to the same database table! 🎉
