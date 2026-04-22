import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import useQueueStore from './queueStore';

const APPOINTMENT_SELECT = `
  *,
  patients (name, phone)
`;

const isToday = (dateTime) => {
  if (!dateTime) return false;

  const date = new Date(dateTime);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const hasSlotConflict = async (dateTime, excludeId = null) => {
  if (!dateTime) return false;

  const start = new Date(dateTime);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 1);

  let query = supabase
    .from('appointments')
    .select('id')
    .gte('date_time', start.toISOString())
    .lt('date_time', end.toISOString())
    .neq('status', 'canceled')
    .limit(1);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).length > 0;
};

const useAppointmentStore = create((set, get) => ({
  appointments: [],
  loading: false,

  fetchAppointments: async () => {
    set({ loading: true });

    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .order('date_time', { ascending: true });

    if (error) {
      set({ loading: false });
      throw error;
    }

    set({ appointments: data ?? [], loading: false });
  },

  addAppointment: async (appointment) => {
    const occupied = await hasSlotConflict(appointment.date_time);
    if (occupied) {
      throw new Error('This appointment time is already booked. Please choose another time slot.');
    }

    const { error } = await supabase
      .from('appointments')
      .insert([appointment]);

    if (error) throw error;

    if ((appointment.status === 'scheduled' || appointment.status === 'in-progress') && isToday(appointment.date_time)) {
      await useQueueStore.getState().ensurePatientInQueueForToday(appointment.patient_id, appointment.date_time);
    }

    await get().fetchAppointments();
  },

  updateAppointment: async (id, updates) => {
    const occupied = await hasSlotConflict(updates.date_time, id);
    if (occupied) {
      throw new Error('This appointment time is already booked. Please choose another time slot.');
    }

    const { error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    const isQueueEligible = updates.status === 'scheduled' || updates.status === 'in-progress';

    if (isQueueEligible && isToday(updates.date_time)) {
      await useQueueStore.getState().ensurePatientInQueueForToday(updates.patient_id, updates.date_time);
    }

    if (!isQueueEligible || !isToday(updates.date_time)) {
      await useQueueStore.getState().removePatientFromActiveQueue(updates.patient_id);
    }

    await get().fetchAppointments();
  },

  deleteAppointment: async (id) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;

    await get().fetchAppointments();
  },
}));

export default useAppointmentStore;
