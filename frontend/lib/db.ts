import { supabase } from './supabase';

export interface UserProfileInsert {
  skin_type: string;
  skin_concerns: string[];
  climate_zone: string;
  allergies: string[];
  budget_range: string;
}

export interface ProgressLogInsert {
  log_date: string;
  skin_condition: string;
  notes: string;
}

export async function saveUserProfile(profile: UserProfileInsert) {
  const payload = {
    skin_type: profile.skin_type,
    skin_concerns: profile.skin_concerns,
    climate_zone: profile.climate_zone,
    allergies: profile.allergies || [],
    budget_range: profile.budget_range,
  };

  const { error } = await supabase
    .from('user_profiles')
    .insert(payload);

  if (error) {
    console.error('Failed to save user profile:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message || 'Failed to save user profile');
  }

  return true;
}

export async function saveProgressLog(log: ProgressLogInsert) {
  const payload = {
    log_date: log.log_date,
    skin_condition: log.skin_condition,
    notes: log.notes,
  };

  const { data, error } = await supabase
    .from('progress_logs')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save progress log:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message || 'Failed to save progress log');
  }

  return data;
}

export async function getProgressLogs() {
  const { data, error } = await supabase
    .from('progress_logs')
    .select('*')
    .order('log_date', { ascending: false });

  if (error) {
    console.error('Failed to fetch progress logs:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message || 'Failed to fetch progress logs');
  }

  return data || [];
}

export async function deleteProgressLog(logId: string) {
  const { data, error } = await supabase
    .from('progress_logs')
    .delete()
    .eq('id', logId)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to delete progress log:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(error.message || 'Failed to delete progress log');
  }

  return data;
}