// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

async function computeRiskScore(scores: number[]): Promise<number> {
  const valid = scores.filter((s) => Number.isFinite(s));
  if (valid.length === 0) return 0;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  // Map average test scores (0-100 each) to risk (0-100) inversely as placeholder.
  return Math.round(100 - Math.max(0, Math.min(100, avg)));
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const env = Deno.env.toObject() as unknown as Env;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { session_id, job_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
    }

    // Mark job processing if provided
    if (job_id) {
      await supabase.from('analysis_jobs').update({ status: 'processing' as JobStatus }).eq('id', job_id);
    }

    // Fetch scores for the session
    const { data: results, error: resErr } = await supabase
      .from('test_results')
      .select('score')
      .eq('session_id', session_id);
    if (resErr) throw resErr;

    const scores = (results || []).map((r: any) => Number(r.score ?? 0));
    const risk = await computeRiskScore(scores);

    // Update session with overall risk and completion timestamp if not set
    const { error: updErr } = await supabase
      .from('test_sessions')
      .update({ overall_risk_score: risk, completed_at: new Date().toISOString() })
      .eq('id', session_id);
    if (updErr) throw updErr;

    if (job_id) {
      await supabase.from('analysis_jobs').update({ status: 'completed' as JobStatus }).eq('id', job_id);
    }

    return new Response(JSON.stringify({ session_id, risk }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    // Try to mark job failed if job_id present in body
    try {
      const env = Deno.env.toObject() as unknown as Env;
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const body = await (async () => { try { return await (await req.clone().json()); } catch { return {}; } })();
      if (body?.job_id) {
        await supabase.from('analysis_jobs').update({ status: 'failed' as JobStatus, error: String(e?.message || e) }).eq('id', body.job_id);
      }
    } catch {}
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}

// Standard Deno entrypoint for Supabase Edge Functions
serve(handler);


