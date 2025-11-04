-- TourCompanion SaaS Platform - Seed Data
-- This file contains sample data for testing and development

-- ===========================================
-- SAMPLE CREATORS (Tour Creators/Agencies)
-- ===========================================

-- Insert sample creators
INSERT INTO public.creators (
  id,
  user_id,
  agency_name,
  agency_logo,
  contact_email,
  phone,
  website,
  address,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440011',
  'Virtual Tours Pro',
  'https://example.com/logo1.png',
  'contact@virtualtourspro.com',
  '+1-555-0101',
  'https://virtualtourspro.com',
  '123 Business St, City, State 12345',
  'pro',
  'active',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440012',
  'Real Estate Visuals',
  'https://example.com/logo2.png',
  'info@realestatevisuals.com',
  '+1-555-0102',
  'https://realestatevisuals.com',
  '456 Real Estate Ave, City, State 12345',
  'basic',
  'active',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '2 days'
);

-- ===========================================
-- SAMPLE END CLIENTS
-- ===========================================

INSERT INTO public.end_clients (
  id,
  creator_id,
  name,
  email,
  company,
  phone,
  website,
  status,
  created_at,
  updated_at
) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'John Smith',
  'john@luxuryhotel.com',
  'Luxury Hotel Group',
  '+1-555-0201',
  'https://luxuryhotel.com',
  'active',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '3 days'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Sarah Johnson',
  'sarah@techcorp.com',
  'TechCorp Solutions',
  '+1-555-0202',
  'https://techcorp.com',
  'active',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '1 day'
),
(
  '660e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440002',
  'Mike Wilson',
  'mike@restaurant.com',
  'Fine Dining Restaurant',
  '+1-555-0203',
  'https://finedining.com',
  'active',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '1 day'
);

-- ===========================================
-- SAMPLE PROJECTS
-- ===========================================

INSERT INTO public.projects (
  id,
  end_client_id,
  title,
  description,
  project_type,
  status,
  created_at,
  updated_at
) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  'Luxury Hotel Virtual Tour',
  'Complete 360-degree virtual tour of our luxury hotel including all rooms, amenities, and common areas. High-quality photography and interactive hotspots.',
  'virtual_tour',
  'active',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '2 days'
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440002',
  'TechCorp Office Showcase',
  'Virtual tour of our modern office space showcasing our innovative work environment and company culture.',
  'virtual_tour',
  'active',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '1 day'
),
(
  '770e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440003',
  'Restaurant Dining Experience',
  'Immersive virtual tour of our restaurant including dining areas, kitchen, and outdoor seating.',
  'virtual_tour',
  'draft',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
);

-- ===========================================
-- SAMPLE CHATBOTS
-- ===========================================

INSERT INTO public.chatbots (
  id,
  project_id,
  name,
  status,
  welcome_message,
  fallback_message,
  language,
  created_at,
  updated_at
) VALUES 
(
  '880e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  'Hotel Concierge Bot',
  'active',
  'Welcome to Luxury Hotel! I can help you with room information, amenities, and booking assistance.',
  'I apologize, but I need more information to help you. Please contact our front desk at (555) 123-4567.',
  'en',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '1 day'
),
(
  '880e8400-e29b-41d4-a716-446655440002',
  '770e8400-e29b-41d4-a716-446655440002',
  'TechCorp Assistant',
  'active',
  'Hello! I can provide information about our company, services, and career opportunities.',
  'Thank you for your interest! Please visit our website or contact us directly for more information.',
  'en',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '1 day'
);

-- ===========================================
-- SAMPLE ANALYTICS DATA
-- ===========================================

INSERT INTO public.analytics (
  id,
  project_id,
  metric_type,
  metric_value,
  date,
  created_at
) VALUES 
-- Hotel project analytics
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'view', 150, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'view', 200, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'unique_visitor', 45, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'chatbot_interaction', 25, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- TechCorp project analytics
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'view', 89, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'view', 120, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'unique_visitor', 32, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 'chatbot_interaction', 18, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- ===========================================
-- SAMPLE LEADS
-- ===========================================

INSERT INTO public.leads (
  id,
  chatbot_id,
  name,
  email,
  phone,
  company,
  message,
  status,
  created_at,
  updated_at
) VALUES 
(
  'aa0e8400-e29b-41d4-a716-446655440001',
  '880e8400-e29b-41d4-a716-446655440001',
  'Alice Brown',
  'alice@email.com',
  '+1-555-0301',
  'Travel Agency Inc',
  'Interested in booking a corporate event for 50 people. Can you provide more information about your conference facilities?',
  'new',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  'aa0e8400-e29b-41d4-a716-446655440002',
  '880e8400-e29b-41d4-a716-446655440001',
  'Bob Davis',
  'bob@email.com',
  '+1-555-0302',
  'Wedding Planners LLC',
  'Looking for a venue for a wedding reception. What packages do you offer?',
  'contacted',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
),
(
  'aa0e8400-e29b-41d4-a716-446655440003',
  '880e8400-e29b-41d4-a716-446655440002',
  'Carol White',
  'carol@email.com',
  '+1-555-0303',
  'Tech Startup',
  'Interested in your software development services. Can we schedule a meeting?',
  'new',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- ===========================================
-- SAMPLE REQUESTS
-- ===========================================

INSERT INTO public.requests (
  id,
  project_id,
  end_client_id,
  title,
  description,
  request_type,
  priority,
  status,
  created_at,
  updated_at
) VALUES 
(
  'bb0e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  'Update Hotel Room Photos',
  'We have renovated several rooms and need to update the virtual tour with new photos. Please schedule a photo shoot for next week.',
  'content_change',
  'high',
  'pending',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  'bb0e8400-e29b-41d4-a716-446655440002',
  '770e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440002',
  'Add New Office Space',
  'We have expanded our office and need to add the new wing to the virtual tour.',
  'content_change',
  'medium',
  'in_progress',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '2 days'
);

-- ===========================================
-- SAMPLE ASSETS
-- ===========================================

INSERT INTO public.assets (
  id,
  project_id,
  creator_id,
  filename,
  original_filename,
  file_type,
  file_size,
  file_url,
  thumbnail_url,
  created_at
) VALUES 
(
  'cc0e8400-e29b-41d4-a716-446655440001',
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'hotel-lobby-001.jpg',
  'hotel-lobby-001.jpg',
  'image/jpeg',
  2048576,
  'https://example.com/assets/hotel-lobby-001.jpg',
  'https://example.com/assets/thumbs/hotel-lobby-001.jpg',
  NOW() - INTERVAL '15 days'
),
(
  'cc0e8400-e29b-41d4-a716-446655440002',
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'hotel-room-suite.jpg',
  'hotel-room-suite.jpg',
  'image/jpeg',
  1536000,
  'https://example.com/assets/hotel-room-suite.jpg',
  'https://example.com/assets/thumbs/hotel-room-suite.jpg',
  NOW() - INTERVAL '12 days'
),
(
  'cc0e8400-e29b-41d4-a716-446655440003',
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'office-open-space.jpg',
  'office-open-space.jpg',
  'image/jpeg',
  1800000,
  'https://example.com/assets/office-open-space.jpg',
  'https://example.com/assets/thumbs/office-open-space.jpg',
  NOW() - INTERVAL '8 days'
);

-- ===========================================
-- SAMPLE END_CLIENT_USERS (for authentication)
-- ===========================================

INSERT INTO public.end_client_users (
  id,
  user_id,
  end_client_id,
  email,
  created_at
) VALUES 
(
  'dd0e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440013',
  '660e8400-e29b-41d4-a716-446655440001',
  'john@luxuryhotel.com',
  NOW() - INTERVAL '20 days'
),
(
  'dd0e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440014',
  '660e8400-e29b-41d4-a716-446655440002',
  'sarah@techcorp.com',
  NOW() - INTERVAL '15 days'
);

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check if data was inserted correctly
SELECT 'Creators' as table_name, COUNT(*) as count FROM public.creators
UNION ALL
SELECT 'End Clients', COUNT(*) FROM public.end_clients
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Chatbots', COUNT(*) FROM public.chatbots
UNION ALL
SELECT 'Analytics', COUNT(*) FROM public.analytics
UNION ALL
SELECT 'Leads', COUNT(*) FROM public.leads
UNION ALL
SELECT 'Requests', COUNT(*) FROM public.requests
UNION ALL
SELECT 'Assets', COUNT(*) FROM public.assets
UNION ALL
SELECT 'End Client Users', COUNT(*) FROM public.end_client_users;



