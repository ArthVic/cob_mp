import { supabase } from "./client";

const SESSION_KEY = "current_test_session_id";

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function getSavedSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function saveSessionId(sessionId: string) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export async function ensureSession(): Promise<string> {
  const existing = getSavedSessionId();
  if (existing) return existing;
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("test_sessions")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  saveSessionId(data.id);
  return data.id;
}

export async function addTestResult(params: {
  sessionId?: string;
  testType:
    | "memory"
    | "fluency"
    | "clock"
    | "reaction"
    | "digit_span"
    | "recall";
  rawData?: unknown;
  score?: number;
}): Promise<string> {
  const session_id = params.sessionId ?? (await ensureSession());
  const { data, error } = await supabase
    .from("test_results")
    .insert({
      session_id,
      test_type: params.testType,
      raw_data: params.rawData ?? null,
      score: params.score ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function enqueueAnalysisAndProcess(sessionId?: string) {
  const sid = sessionId ?? (await ensureSession());
  const { data: job, error: jobErr } = await supabase
    .from("analysis_jobs")
    .insert({ session_id: sid })
    .select("id")
    .single();
  if (jobErr) throw jobErr;

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-analysis`;
  const { data: session } = await supabase.auth.getSession();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.session?.access_token ?? ""}`,
    },
    body: JSON.stringify({ session_id: sid, job_id: job.id }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return sid;
}

export async function fetchSessionAndResults(sessionId?: string) {
  const sid = sessionId ?? (await ensureSession());
  const { data: session, error: sErr } = await supabase
    .from("test_sessions")
    .select("id, overall_risk_score, started_at, completed_at")
    .eq("id", sid)
    .single();
  if (sErr) throw sErr;
  const { data: results, error: rErr } = await supabase
    .from("test_results")
    .select("test_type, score, interpretation")
    .eq("session_id", sid)
    .order("created_at", { ascending: true });
  if (rErr) throw rErr;
  return { session, results } as const;
}

export async function generateReport(sessionId?: string) {
  const sid = sessionId ?? (await ensureSession());
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`;
  const { data: session } = await supabase.auth.getSession();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.session?.access_token ?? ""}`,
    },
    body: JSON.stringify({ session_id: sid, patient_id: userId }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return (await res.json()) as { path: string; url: string | null };
}


