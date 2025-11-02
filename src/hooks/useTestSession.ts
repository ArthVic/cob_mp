import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type TestSession = Tables<'test_sessions'>;

export function useTestSession() {
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('test_sessions')
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      setSession(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (sessionId: string, overallRiskScore: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('test_sessions')
        .update({
          completed_at: new Date().toISOString(),
          overall_risk_score: overallRiskScore,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) throw updateError;

      setSession(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete session';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    error,
    createSession,
    completeSession,
  };
}
