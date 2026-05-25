import { supabase } from "./supabase"

export interface UserProfileInsert {
  skin_type: string
  skin_concerns: string[]
  climate_zone: string
  allergies: string[]
  budget_range: string
}

export interface ProgressLogInsert {
  log_date: string
  skin_condition: string
  notes: string
}

export async function saveUserProfile(profile: UserProfileInsert) {
  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // If user is not authenticated, store locally and return
    if (authError || !user) {
      console.warn("User not authenticated. Saving profile locally. It will sync after login.")
      localStorage.setItem('pendingUserProfile', JSON.stringify(profile))
      return { stored_locally: true }
    }

    const payload = {
      id: user.id,
      skin_type: profile.skin_type,
      skin_concerns: profile.skin_concerns,
      climate_zone: profile.climate_zone,
      allergies: profile.allergies,
      budget_range: profile.budget_range,
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .insert(payload)
      .select()

    if (error) {
      console.error("Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error("saveUserProfile failed:", err)
    throw err
  }
}

export async function syncPendingProfile() {
  try {
    const pendingProfile = localStorage.getItem('pendingUserProfile')
    if (!pendingProfile) return

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return

    const profile = JSON.parse(pendingProfile) as UserProfileInsert
    
    const payload = {
      id: user.id,
      skin_type: profile.skin_type,
      skin_concerns: profile.skin_concerns,
      climate_zone: profile.climate_zone,
      allergies: profile.allergies,
      budget_range: profile.budget_range,
    }

    const { error } = await supabase
      .from("user_profiles")
      .insert(payload)
      .select()

    if (!error) {
      localStorage.removeItem('pendingUserProfile')
    }
  } catch (err) {
    console.error("syncPendingProfile failed:", err)
  }
}

export async function saveProgressLog(log: ProgressLogInsert) {
  try {
    const payload = {
      log_date: log.log_date,
      skin_condition: log.skin_condition,
      notes: log.notes,
    }

    const { data, error } = await supabase
      .from("progress_logs")
      .insert(payload)

    if (error) {
      console.error("Supabase progress log error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error("saveProgressLog failed:", err)
    throw err
  }
}

export async function getProgressLogs() {
  try {
    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .order("log_date", { ascending: false })

    if (error) {
      console.error("Fetch progress logs failed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error("getProgressLogs failed:", err)
    throw err
  }
}