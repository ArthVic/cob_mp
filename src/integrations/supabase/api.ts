import { supabase } from './client';
import type { Database } from './types';

/**
 * Create a new test session for the current user
 * Stores session ID in localStorage for use in test pages
 */
export async function ensureSession(): Promise<string> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated. Please sign in first.');
    }

    // Verify profile exists (created by trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found. Please try signing in again.');
    }

    // Create new test session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .insert({
        user_id: user.id,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (sessionError || !session) {
      throw new Error('Failed to create test session');
    }

    // Store session ID in localStorage
    localStorage.setItem('currentSessionId', session.id);
    
    return session.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('ensureSession error:', error);
    throw new Error(`Failed to start test session: ${message}`);
  }
}

/**
 * Get current session ID from localStorage
 */
export function getCurrentSessionId(): string | null {
  return localStorage.getItem('currentSessionId');
}

/**
 * Clear session ID from localStorage
 */
export function clearSessionId(): void {
  localStorage.removeItem('currentSessionId');
}

/**
 * Save individual test result
 */
export async function saveTestResult(
  sessionId: string,
  testType: Database['public']['Enums']['test_type'],
  score: number,
  rawData?: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        session_id: sessionId,
        test_type: testType,
        score,
        raw_data: rawData || {},
        interpretation: `${testType}: ${score}/10`,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('saveTestResult error:', error);
    throw new Error(`Failed to save ${testType} test result`);
  }
}

/**
 * Complete a test session with overall risk score
 */
export async function completeSession(sessionId: string, overallRiskScore: number) {
  try {
    const { data, error } = await supabase
      .from('test_sessions')
      .update({
        completed_at: new Date().toISOString(),
        overall_risk_score: overallRiskScore,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    
    // Clear session from storage after completion
    clearSessionId();
    
    return data;
  } catch (error) {
    console.error('completeSession error:', error);
    throw new Error('Failed to complete test session');
  }
}

/**
 * Get all test results for a session
 */
export async function getSessionResults(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getSessionResults error:', error);
    return [];
  }
}

/**
 * Get user's profile
 */
export async function getUserProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getUserProfile error:', error);
    return null;
  }
}

/**
 * Get user's role
 */
export async function getUserRole() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) return 'user'; // default role
    return data?.role || 'user';
  } catch (error) {
    console.error('getUserRole error:', error);
    return 'user';
  }
}

/**
 * Check if user is a clinician
 */
export async function isClinicianUser(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'clinician';
}

/**
 * Get all user sessions (clinician only)
 */
export async function getAllSessions() {
  try {
    // RLS will handle access control
    const { data, error } = await supabase
      .from('test_sessions')
      .select(`
        *,
        profiles:user_id (name, email, age),
        test_results (*)
      `)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getAllSessions error:', error);
    return [];
  }
}

/**
 * Save audio recording for test result
 */
export async function saveAudioRecording(
  testResultId: string,
  fileUrl: string,
  transcription?: string,
  acousticFeatures?: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from('audio_recordings')
      .insert({
        test_result_id: testResultId,
        file_url: fileUrl,
        transcription,
        acoustic_features: acousticFeatures || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('saveAudioRecording error:', error);
    throw new Error('Failed to save audio recording');
  }
}
