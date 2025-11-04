import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Default manifest for tour creators
const defaultManifest = {
  "name": "TourCompanion - Virtual Tour Dashboard",
  "short_name": "TourCompanion",
  "description": "Professional dashboard for managing virtual tours and client projects. Create, manage, and share immersive virtual experiences.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b1426",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "categories": ["business", "productivity", "real-estate"],
  "lang": "it",
  "dir": "ltr",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "TourCompanion Dashboard"
    },
    {
      "src": "/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "TourCompanion Mobile App"
    }
  ],
  "shortcuts": [
    {
      "name": "Projects",
      "short_name": "Projects",
      "description": "Manage your projects",
      "url": "/?shortcut=tours",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Clients",
      "short_name": "Clients",
      "description": "View client dashboards",
      "url": "/?shortcut=appointments",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Analytics",
      "short_name": "Analytics",
      "description": "View analytics",
      "url": "/?shortcut=stats",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false,
  "edge_side_panel": {
    "preferred_width": 400
  }
};

export const handler: Handler = async (event) => {
  const projectId = event.queryStringParameters?.projectId;
  
  if (!projectId) {
    // Return default manifest for tour creators
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify(defaultManifest)
    };
  }
  
  try {
    // Fetch project data from Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        project_type,
        end_clients (
          id,
          name,
          company
        )
      `)
      .eq('id', projectId)
      .eq('status', 'active')
      .single();
    
    if (error || !project) {
      console.error('Error fetching project:', error);
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Project not found' })
      };
    }
    
    // Generate client-specific manifest
    const manifest = {
      "name": `${project.title} Dashboard`,
      "short_name": project.title,
      "description": `Dashboard for ${project.end_clients?.company || 'Client'}`,
      "start_url": `/client/${projectId}`,
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#3b82f6",
      "orientation": "portrait-primary",
      "categories": ["business", "productivity"],
      "lang": "en",
      "dir": "ltr",
      "scope": `/client/${projectId}`,
      "icons": [
        {
          "src": "/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/apple-touch-icon.png",
          "sizes": "180x180",
          "type": "image/png"
        }
      ],
      "screenshots": [
        {
          "src": "/screenshot-wide.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide",
          "label": `${project.title} Dashboard`
        },
        {
          "src": "/screenshot-mobile.png",
          "sizes": "390x844",
          "type": "image/png",
          "form_factor": "narrow",
          "label": `${project.title} Mobile App`
        }
      ],
      "shortcuts": [
        {
          "name": "Overview",
          "short_name": "Overview",
          "description": "Project overview",
          "url": `/client/${projectId}?tab=overview`,
          "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
        },
        {
          "name": "Media",
          "short_name": "Media",
          "description": "View media library",
          "url": `/client/${projectId}?tab=media`,
          "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
        },
        {
          "name": "Requests",
          "short_name": "Requests",
          "description": "Submit requests",
          "url": `/client/${projectId}?tab=requests`,
          "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
        }
      ],
      "related_applications": [],
      "prefer_related_applications": false
    };
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      },
      body: JSON.stringify(manifest)
    };
    
  } catch (error) {
    console.error('Error generating manifest:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
