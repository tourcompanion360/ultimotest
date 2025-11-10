-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  client_name TEXT,
  project_type TEXT NOT NULL DEFAULT 'virtual_tour',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects (allow anonymous access)
CREATE POLICY "Allow anonymous access to projects"
ON public.projects
FOR ALL
USING (true);

-- Create trigger for updated_at column
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample projects
INSERT INTO public.projects (title, description, thumbnail_url, client_name, project_type, status, views) VALUES
('Modern Office Space', 'A contemporary office environment with open spaces and modern furniture', '/uploads/008d5b1f-dd3a-4cc0-8c25-1809ffec80e6.png', 'Sarah Johnson', 'virtual_tour', 'active', 45),
('Luxury Showroom', 'High-end retail space showcasing premium products', '/uploads/1229f379-fe71-4917-8665-31a12c330e74.png', 'Michael Chen', 'virtual_tour', 'active', 32),
('Restaurant Interior', 'Elegant dining space with warm lighting and comfortable seating', '/uploads/22976e00-bbd0-4a53-bb79-93f84f97d1b1.png', 'Emily Rodriguez', 'virtual_tour', 'active', 28),
('Tech Startup Office', 'Innovative workspace designed for collaboration and creativity', '/uploads/34b1a564-66ef-422f-a5f5-91c241873ab2.png', 'David Thompson', 'virtual_tour', 'inactive', 15),
('Boutique Hotel Lobby', 'Sophisticated hotel entrance with luxury amenities', '/uploads/8d9c89d5-3c52-4ee8-997b-874e8784f081.png', 'Lisa Wang', 'virtual_tour', 'active', 67);







