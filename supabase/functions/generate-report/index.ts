// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const env = Deno.env.toObject() as unknown as Env;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { session_id, patient_id } = await req.json();
    if (!session_id || !patient_id) {
      return new Response(JSON.stringify({ error: 'Missing session_id or patient_id' }), { status: 400 });
    }

    const { data: session, error: sessionErr } = await supabase
      .from('test_sessions')
      .select('id, user_id, started_at, completed_at, overall_risk_score')
      .eq('id', session_id)
      .single();
    if (sessionErr) throw sessionErr;

    const { data: results, error: resultsErr } = await supabase
      .from('test_results')
      .select('test_type, score, interpretation')
      .eq('session_id', session_id);
    if (resultsErr) throw resultsErr;

    const report = {
      session,
      results,
      generated_at: new Date().toISOString(),
      what_this_means: "This is a preliminary, non-diagnostic screening. Consult a clinician for evaluation.",
    };

    const bytes = new TextEncoder().encode(JSON.stringify(report, null, 2));
    const path = `${patient_id}/${session_id}.json`;

    const { error: uploadErr } = await supabase.storage.from('reports').upload(path, bytes, {
      contentType: 'application/json',
      upsert: true,
    } as any);
    if (uploadErr) throw uploadErr;

    const { data: file } = supabase.storage.from('reports').getPublicUrl(path);

    return new Response(JSON.stringify({ path, url: file?.publicUrl ?? null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}

serve(handler);


