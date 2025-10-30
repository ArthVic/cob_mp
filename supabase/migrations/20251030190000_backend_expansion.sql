-- Backend expansion: consents, analysis jobs, sharing, notes, storage, policies

-- Consents table
CREATE TABLE IF NOT EXISTS public.consents (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreed BOOLEAN NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own consent"
  ON public.consents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Analysis job status enum
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('pending','processing','completed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Analysis jobs table
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  status public.job_status NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their session jobs"
  ON public.analysis_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions s
      WHERE s.id = analysis_jobs.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert job for their session"
  ON public.analysis_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions s
      WHERE s.id = analysis_jobs.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their session jobs"
  ON public.analysis_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions s
      WHERE s.id = analysis_jobs.session_id AND s.user_id = auth.uid()
    )
  );

-- Patient sharing (patient grants clinician access)
CREATE TABLE IF NOT EXISTS public.patient_shares (
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (patient_id, clinician_id)
);

ALTER TABLE public.patient_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their shares"
  ON public.patient_shares FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view shares addressed to them"
  ON public.patient_shares FOR SELECT
  USING (auth.uid() = clinician_id);

-- Clinical notes
CREATE TABLE IF NOT EXISTS public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinician can create notes for shared patient"
  ON public.clinical_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_shares ps
      WHERE ps.patient_id = clinical_notes.patient_id
      AND ps.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinician can view their notes for shared patient"
  ON public.clinical_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_shares ps
      WHERE ps.patient_id = clinical_notes.patient_id
      AND ps.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Patient can view notes written about them"
  ON public.clinical_notes FOR SELECT
  USING (auth.uid() = patient_id);

-- Replace broad clinician read policies with share-based access
DROP POLICY IF EXISTS "Clinicians can view all sessions" ON public.test_sessions;
DROP POLICY IF EXISTS "Clinicians can view all test results" ON public.test_results;
DROP POLICY IF EXISTS "Clinicians can view all audio recordings" ON public.audio_recordings;

CREATE POLICY "Clinician can view shared sessions"
  ON public.test_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_shares ps
      WHERE ps.patient_id = test_sessions.user_id
      AND ps.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinician can view shared test results"
  ON public.test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions s
      JOIN public.patient_shares ps ON ps.patient_id = s.user_id
      WHERE s.id = test_results.session_id
      AND ps.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinician can view shared audio recordings"
  ON public.audio_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_results r
      JOIN public.test_sessions s ON s.id = r.session_id
      JOIN public.patient_shares ps ON ps.patient_id = s.user_id
      WHERE r.id = audio_recordings.test_result_id
      AND ps.clinician_id = auth.uid()
    )
  );

-- Storage: buckets for audio and reports
INSERT INTO storage.buckets (id, name, public) VALUES ('audio','audio', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('reports','reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio bucket: users can manage files under their prefix `${user_id}/...`
CREATE POLICY "Users can upload own audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'audio' AND (position((auth.uid())::text || '/' in name) = 1)
  );

CREATE POLICY "Users can read own audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'audio' AND (position((auth.uid())::text || '/' in name) = 1)
  );

CREATE POLICY "Users can delete own audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'audio' AND (position((auth.uid())::text || '/' in name) = 1)
  );

-- Clinicians can read audio for shared patients
CREATE POLICY "Clinicians can read shared patient audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'audio' AND EXISTS (
      SELECT 1 FROM public.patient_shares ps
      WHERE ps.clinician_id = auth.uid()
      AND position(ps.patient_id::text || '/' in name) = 1
    )
  );

-- Storage policies for reports bucket (same pattern)
CREATE POLICY "Users can manage own reports"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'reports' AND (position((auth.uid())::text || '/' in name) = 1)
  )
  WITH CHECK (
    bucket_id = 'reports' AND (position((auth.uid())::text || '/' in name) = 1)
  );

CREATE POLICY "Clinicians can read shared patient reports"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'reports' AND EXISTS (
      SELECT 1 FROM public.patient_shares ps
      WHERE ps.clinician_id = auth.uid()
      AND position(ps.patient_id::text || '/' in name) = 1
    )
  );

-- Trigger to keep analysis_jobs.updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_analysis_jobs_updated ON public.analysis_jobs;
CREATE TRIGGER trg_analysis_jobs_updated
BEFORE UPDATE ON public.analysis_jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


