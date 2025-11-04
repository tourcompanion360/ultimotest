-- Add missing tables that are referenced in the codebase

-- 1. CHATBOT_REQUESTS TABLE (Referenced in AdminDashboard, ChatbotRequests, etc.)
CREATE TABLE IF NOT EXISTS public.chatbot_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('hotspot_update', 'content_change', 'design_modification', 'new_feature', 'bug_fix')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  attachments JSONB DEFAULT '[]',
  creator_notes TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. END_CLIENT_USERS TABLE (Referenced in ClientPortal)
CREATE TABLE IF NOT EXISTS public.end_client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONVERSATION_MESSAGES TABLE (Referenced in ChatbotInsights)
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'bot', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MEMORY_INSIGHTS TABLE (Referenced in ChatbotInsights)
CREATE TABLE IF NOT EXISTS public.memory_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('question', 'feedback', 'pattern', 'trend')),
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CHATBOT_QUESTIONS TABLE (Referenced in ConversationalIntelligence)
CREATE TABLE IF NOT EXISTS public.chatbot_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  frequency INTEGER DEFAULT 1,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'unanswered' CHECK (status IN ('answered', 'unanswered', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PROMOTIONS TABLE (Referenced in Promotions component)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  target_audience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. APPOINTMENTS TABLE (Referenced in useAppuntamenti hook)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  end_client_id UUID REFERENCES public.end_clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('site_visit', 'delivery', 'presentation', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX idx_chatbot_requests_project_id ON public.chatbot_requests(project_id);
CREATE INDEX idx_chatbot_requests_end_client_id ON public.chatbot_requests(end_client_id);
CREATE INDEX idx_chatbot_requests_status ON public.chatbot_requests(status);
CREATE INDEX idx_end_client_users_end_client_id ON public.end_client_users(end_client_id);
CREATE INDEX idx_end_client_users_email ON public.end_client_users(email);
CREATE INDEX idx_conversation_messages_chatbot_id ON public.conversation_messages(chatbot_id);
CREATE INDEX idx_conversation_messages_session_id ON public.conversation_messages(session_id);
CREATE INDEX idx_memory_insights_chatbot_id ON public.memory_insights(chatbot_id);
CREATE INDEX idx_chatbot_questions_chatbot_id ON public.chatbot_questions(chatbot_id);
CREATE INDEX idx_chatbot_questions_status ON public.chatbot_questions(status);
CREATE INDEX idx_promotions_creator_id ON public.promotions(creator_id);
CREATE INDEX idx_promotions_status ON public.promotions(status);
CREATE INDEX idx_appointments_creator_id ON public.appointments(creator_id);
CREATE INDEX idx_appointments_end_client_id ON public.appointments(end_client_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_chatbot_requests_updated_at
  BEFORE UPDATE ON public.chatbot_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_end_client_users_updated_at
  BEFORE UPDATE ON public.end_client_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_questions_updated_at
  BEFORE UPDATE ON public.chatbot_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on new tables
ALTER TABLE public.chatbot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.end_client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Creators can manage chatbot requests" ON public.chatbot_requests
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "End clients can manage their chatbot requests" ON public.chatbot_requests
  FOR ALL USING (
    end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
  );

CREATE POLICY "Creators can manage end client users" ON public.end_client_users
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "End client users can view their own data" ON public.end_client_users
  FOR SELECT USING (
    end_client_id = (auth.jwt() ->> 'end_client_id')::uuid
  );

CREATE POLICY "Creators can manage conversation messages" ON public.conversation_messages
  FOR ALL USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage memory insights" ON public.memory_insights
  FOR ALL USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage chatbot questions" ON public.chatbot_questions
  FOR ALL USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      JOIN public.end_clients ec ON p.end_client_id = ec.id
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage their promotions" ON public.promotions
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage their appointments" ON public.appointments
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON public.chatbot_requests TO anon, authenticated;
GRANT ALL ON public.end_client_users TO anon, authenticated;
GRANT ALL ON public.conversation_messages TO anon, authenticated;
GRANT ALL ON public.memory_insights TO anon, authenticated;
GRANT ALL ON public.chatbot_questions TO anon, authenticated;
GRANT ALL ON public.promotions TO anon, authenticated;
GRANT ALL ON public.appointments TO anon, authenticated;
