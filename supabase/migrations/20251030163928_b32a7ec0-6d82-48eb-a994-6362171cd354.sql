-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 20 AND age <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'clinician');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create enum for test types
CREATE TYPE public.test_type AS ENUM ('memory', 'fluency', 'clock', 'reaction', 'digit_span', 'recall');

-- Create test_sessions table
CREATE TABLE public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  overall_risk_score FLOAT CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100)
);

-- Enable RLS on test_sessions
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Create test_results table
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  test_type public.test_type NOT NULL,
  raw_data JSONB,
  score FLOAT,
  interpretation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on test_results
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create audio_recordings table
CREATE TABLE public.audio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_result_id UUID REFERENCES public.test_results(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  transcription TEXT,
  acoustic_features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on audio_recordings
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'clinician'));

-- RLS Policies for test_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.test_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can view all sessions"
  ON public.test_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'clinician'));

-- RLS Policies for test_results
CREATE POLICY "Users can view their own test results"
  ON public.test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = test_results.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own test results"
  ON public.test_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = test_results.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can view all test results"
  ON public.test_results FOR SELECT
  USING (public.has_role(auth.uid(), 'clinician'));

-- RLS Policies for audio_recordings
CREATE POLICY "Users can view their own audio recordings"
  ON public.audio_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_results
      JOIN public.test_sessions ON test_results.session_id = test_sessions.id
      WHERE test_results.id = audio_recordings.test_result_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own audio recordings"
  ON public.audio_recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_results
      JOIN public.test_sessions ON test_results.session_id = test_sessions.id
      WHERE test_results.id = audio_recordings.test_result_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can view all audio recordings"
  ON public.audio_recordings FOR SELECT
  USING (public.has_role(auth.uid(), 'clinician'));

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 50)
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile automatically on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();