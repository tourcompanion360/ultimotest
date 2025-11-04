import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsPayload {
  external_tour_id: string;
  date: string; // YYYY-MM-DD
  metric_type: 'view' | 'unique_visitor' | 'time_spent' | 'hotspot_click' | 'chatbot_interaction' | 'lead_generated';
  metric_value: number;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const body = (await req.json()) as AnalyticsPayload;

    // Find project by external_tour_id
    const { data: project, error: projectErr } = await adminClient
      .from("projects")
      .select("id")
      .eq("external_tour_id", body.external_tour_id)
      .single();

    if (projectErr || !project) {
      throw new Error(`Project not found for external_tour_id: ${body.external_tour_id}`);
    }

    // Insert analytics record
    const { error: insertErr } = await adminClient
      .from("analytics")
      .insert({
        project_id: project.id,
        date: body.date,
        metric_type: body.metric_type,
        metric_value: body.metric_value,
        metadata: body.metadata || {},
      });

    if (insertErr) {
      throw insertErr;
    }

    // Update project views if it's a view metric
    if (body.metric_type === 'view') {
      await adminClient.rpc('increment_project_views', { 
        project_id: project.id,
        amount: body.metric_value 
      }).catch(() => {
        // Fallback if function doesn't exist
        adminClient
          .from('projects')
          .update({ 
            views: adminClient.raw('views + ?', [body.metric_value])
          })
          .eq('id', project.id);
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        project_id: project.id,
        recorded: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Analytics ingest error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to ingest analytics",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});






