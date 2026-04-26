import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const usePatientStore = create((set, get) => ({
  patients: [],
  loading: false,
  error: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        set({ loading: false, error: error.message });
        throw error;
      }

      set({ patients: data ?? [], loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  addPatient: async (patient) => {
    set({ loading: true, error: null });
    try {
      const { error: insertError } = await supabase
        .from('patients')
        .insert([patient]);

      if (insertError) {
        set({ loading: false, error: insertError.message });
        throw insertError;
      }

      // Fetch updated list after successful insert
      await get().fetchPatients();
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updatePatient: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id);

      if (error) {
        set({ loading: false, error: error.message });
        throw error;
      }

      await get().fetchPatients();
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  deletePatient: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) {
        set({ loading: false, error: error.message });
        throw error;
      }

      await get().fetchPatients();
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePatientStore;
