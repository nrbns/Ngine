// Real Supabase client with authentication and real-time subscriptions
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Tests or local dev may use AsyncStorage fallbacks.');
}

export const supabase: SupabaseClient =
  supabaseUrl && supabaseKey
    ? (createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }) as SupabaseClient)
    : ({} as SupabaseClient);


// Real-time subscription helpers
export const subscribeToResolutions = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('resolutions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'resolutions',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToCheckins = (resolutionId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`checkins_${resolutionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'checkins',
        filter: `resolution_id=eq.${resolutionId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToUserProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('profile')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Authentication helpers
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database operations with real-time support
export const database = {
  // User operations
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createUserProfile(userId: string, profile: any) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...profile,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Aims operations
  async getUserAims(userId: string) {
    const { data, error } = await supabase
      .from('aims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createAim(userId: string, aim: { title: string; description?: string }) {
    const { data, error } = await supabase
      .from('aims')
      .insert({
        user_id: userId,
        ...aim,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAim(aimId: string, updates: any) {
    const { data, error } = await supabase
      .from('aims')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', aimId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAim(aimId: string) {
    const { error } = await supabase
      .from('aims')
      .delete()
      .eq('id', aimId);

    if (error) throw error;
  },

  // Resolutions operations
  async getUserResolutions(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('resolutions')
      .select(`
        *,
        aims!inner(title),
        checkins(count)
      `)
      .eq('user_id', userId)
      .gte('end_date', today)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createResolution(userId: string, resolution: any) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (resolution.duration || 30));

    const { data, error } = await supabase
      .from('resolutions')
      .insert({
        user_id: userId,
        aim_id: resolution.aim_id || null,
        title: resolution.title,
        why: resolution.why,
        duration: resolution.duration || 30,
        mdd: resolution.mdd || '5 days per week',
        mdd_value: resolution.mdd_value || 5,
        support: resolution.support || 'gentle',
        status: 'aligned',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check-ins operations
  async createCheckin(resolutionId: string, checkin: {
    execution: string;
    blocker?: string;
    energy: number;
  }) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('checkins')
      .upsert({
        resolution_id: resolutionId,
        date: today,
        execution: checkin.execution,
        blocker: checkin.blocker,
        energy: checkin.energy,
      }, {
        onConflict: 'resolution_id,date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getResolutionCheckins(resolutionId: string, limit = 30) {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('resolution_id', resolutionId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Focus areas operations
  async getUserFocusAreas(userId: string) {
    const { data, error } = await supabase
      .from('user_focus_areas')
      .select('area')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(item => item.area) || [];
  },

  async updateUserFocusAreas(userId: string, areas: string[]) {
    // Delete existing
    await supabase
      .from('user_focus_areas')
      .delete()
      .eq('user_id', userId);

    // Insert new
    if (areas.length > 0) {
      const { error } = await supabase
        .from('user_focus_areas')
        .insert(areas.map(area => ({
          user_id: userId,
          area,
        })));

      if (error) throw error;
    }
  },

  // GOAL PROOFS OPERATIONS (NEW - Proof-of-progress gallery)
  async uploadGoalProof(resolutionId: string, userId: string, file: any, note?: string) {
    // Upload file to Supabase storage
    const fileName = `proofs/${Date.now()}_${file.fileName || 'proof.jpg'}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('goal-proofs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('goal-proofs')
      .getPublicUrl(fileName);

    // Save record to database
    const { data, error } = await supabase
      .from('goal_proofs')
      .insert({
        resolution_id: resolutionId,
        user_id: userId,
        file_url: urlData.publicUrl,
        file_type: file.type?.includes('image') ? 'image' : 'document',
        note: note || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getResolutionGoalProofs(resolutionId: string, limit = 50) {
    const { data, error } = await supabase
      .from('goal_proofs')
      .select('*')
      .eq('resolution_id', resolutionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async deleteGoalProof(proofId: string) {
    // Get proof record first to get file URL
    const { data: proof, error: fetchError } = await supabase
      .from('goal_proofs')
      .select('file_url')
      .eq('id', proofId)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    if (proof.file_url) {
      const fileName = proof.file_url.split('/').pop();
      await supabase.storage
        .from('goal-proofs')
        .remove([`proofs/${fileName}`]);
    }

    // Delete record from database
    const { error } = await supabase
      .from('goal_proofs')
      .delete()
      .eq('id', proofId);

    if (error) throw error;
  },
};