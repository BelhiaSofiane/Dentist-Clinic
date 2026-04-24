import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const fetchUserRole = async (userId) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role ?? null;
};

const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  loading: true,
  initialized: false,
  authSubscription: null,

  signIn: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      throw error;
    }

    const role = await fetchUserRole(data.user?.id);
    set({ user: data.user, role, loading: false });

    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, role: null, loading: false });
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ loading: true });
    
    try {
      // Re-authenticate with current password first
      const { data: { user: currentUser }, error: reauthError } = await supabase.auth.signInWithPassword({
        email: get().user.email,
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error('Current password is incorrect');
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      set({ loading: false, initialized: true });
      throw sessionError;
    }

    if (session?.user) {
      const role = await fetchUserRole(session.user.id);
      set({ user: session.user, role, loading: false });
    } else {
      set({ user: null, role: null, loading: false });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!nextSession?.user) {
        set({ user: null, role: null, loading: false });
        return;
      }

      try {
        const role = await fetchUserRole(nextSession.user.id);
        set({ user: nextSession.user, role, loading: false });
      } catch {
        set({ user: nextSession.user, role: null, loading: false });
      }
    });

    set({ authSubscription: subscription, initialized: true });
  },

  cleanup: () => {
    const subscription = get().authSubscription;
    if (subscription) {
      subscription.unsubscribe();
      set({ authSubscription: null });
    }
  },
}));

export default useAuthStore;
