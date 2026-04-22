import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const usePatientStore = create((set, get) => ({
  patients: [],
  loading: false,

  fetchPatients: async () => {
    set({ loading: true });

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ loading: false });
      throw error;
    }

    set({ patients: data ?? [], loading: false });
  },

  addPatient: async (patient) => {
    const { error } = await supabase
      .from('patients')
      .insert([patient]);

    if (error) throw error;

    await get().fetchPatients();
  },

  updatePatient: async (id, updates) => {
    const { error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    await get().fetchPatients();
  },

  deletePatient: async (id) => {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;

    await get().fetchPatients();
  },
}));

export default usePatientStore;
