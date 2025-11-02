import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Enums } from '@/integrations/supabase/types';
import { calculateRiskScore } from '@/lib/scoring';

type TestResult = Tables<'test_results'>;

export type TestScores = {
  memory: number;
  fluency: number;
  clock: number;
  reactionTime: number;
  digitSpan: number;
};

export function useTestResults(sessionId: string | undefined) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('test_results')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setResults(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch results';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const submitTestResult = async (
    testType: Enums<'test_type'>,
    score: number,
    rawData: Record<string, any>
  ) => {
    try {
      if (!sessionId) throw new Error('No active session');

      setSubmitting(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('test_results')
        .insert({
          session_id: sessionId,
          test_type: testType,
          score,
          raw_data: rawData,
          interpretation: `${testType}: ${score}/10`,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setResults([data, ...results]);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit test';
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    results,
    loading,
    error,
    submitting,
    submitTestResult,
    refetch: fetchResults,
  };
}
