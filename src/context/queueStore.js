import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const QUEUE_SELECT = `
  *,
  patients (name, phone)
`;

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
};

const fetchTodayAppointmentsByPatients = async (patientIds) => {
  if (!patientIds.length) return new Map();

  const { startIso, endIso } = getTodayRange();

  const { data, error } = await supabase
    .from('appointments')
    .select('id, patient_id, date_time, duration, status')
    .in('patient_id', patientIds)
    .gte('date_time', startIso)
    .lt('date_time', endIso)
    .in('status', ['scheduled', 'in-progress'])
    .order('date_time', { ascending: true });

  if (error) throw error;

  const appointmentMap = new Map();

  (data ?? []).forEach((appointment) => {
    if (!appointmentMap.has(appointment.patient_id)) {
      appointmentMap.set(appointment.patient_id, {
        dateTime: appointment.date_time,
        duration: appointment.duration ?? 30,
      });
    }
  });

  return appointmentMap;
};

const useQueueStore = create((set, get) => ({
  queue: [],
  currentPatient: null,
  loading: false,

  fetchQueue: async () => {
    set({ loading: true });

    const { data, error } = await supabase
      .from('queue')
      .select(QUEUE_SELECT)
      .in('status', ['waiting', 'current'])
      .order('created_at', { ascending: true });

    if (error) {
      set({ loading: false });
      throw error;
    }

    const rows = data ?? [];
    const patientIds = [...new Set(rows.map((row) => row.patient_id).filter(Boolean))];
    const appointmentMap = await fetchTodayAppointmentsByPatients(patientIds);
    const todayPatientIds = new Set(appointmentMap.keys());

    const todayRows = rows.filter((row) => todayPatientIds.has(row.patient_id));
    const waitingRows = todayRows.filter((row) => row.status === 'waiting');
    const currentRows = todayRows.filter((row) => row.status === 'current');

    const waitingSorted = [...waitingRows].sort((a, b) => {
      const aTime = appointmentMap.get(a.patient_id)?.dateTime ?? a.created_at;
      const bTime = appointmentMap.get(b.patient_id)?.dateTime ?? b.created_at;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });

    const currentPatientBase = currentRows.length > 0
      ? [...currentRows].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0]
      : null;

    let cumulativeWait = currentPatientBase ? (appointmentMap.get(currentPatientBase.patient_id)?.duration ?? 30) : 0;
    const waitingWithMeta = waitingSorted.map((item) => {
      const appointmentInfo = appointmentMap.get(item.patient_id);
      const avgDurationMinutes = appointmentInfo?.duration ?? 30;
      const expectedStartAt = new Date(Date.now() + cumulativeWait * 60_000).toISOString();
      const queueItem = {
        ...item,
        avgDurationMinutes,
        estimatedWaitMinutes: cumulativeWait,
        expectedStartAt,
      };
      cumulativeWait += avgDurationMinutes;
      return queueItem;
    });

    const currentPatient = currentPatientBase
      ? {
        ...currentPatientBase,
        avgDurationMinutes: appointmentMap.get(currentPatientBase.patient_id)?.duration ?? 30,
      }
      : null;

    set({ queue: waitingWithMeta, currentPatient, loading: false });
  },

  addToQueue: async (patientId) => {
    const { data: existing, error: existingError } = await supabase
      .from('queue')
      .select('id')
      .eq('patient_id', patientId)
      .in('status', ['waiting', 'current'])
      .limit(1);

    if (existingError) throw existingError;
    if ((existing ?? []).length > 0) return;

    const { data: maxPositionData, error: maxPositionError } = await supabase
      .from('queue')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxPositionError) throw maxPositionError;

    const nextPosition = (maxPositionData?.position ?? 0) + 1;

    const { error } = await supabase
      .from('queue')
      .insert([{ patient_id: patientId, position: nextPosition, status: 'waiting' }]);

    if (error) throw error;

    await get().fetchQueue();
  },

  ensurePatientInQueueForToday: async (patientId, dateTime) => {
    if (!patientId || !dateTime) return;

    const { startIso, endIso } = getTodayRange();
    const appointmentDate = new Date(dateTime).toISOString();

    if (appointmentDate < startIso || appointmentDate >= endIso) return;

    await get().addToQueue(patientId);
  },

  syncTodayScheduledAppointmentsToQueue: async () => {
    const { startIso, endIso } = getTodayRange();

    const { data: todayAppointments, error } = await supabase
      .from('appointments')
      .select('patient_id, date_time, status')
      .gte('date_time', startIso)
      .lt('date_time', endIso)
      .in('status', ['scheduled', 'in-progress'])
      .order('date_time', { ascending: true });

    if (error) throw error;

    const uniquePatientIds = [...new Set((todayAppointments ?? []).map((apt) => apt.patient_id).filter(Boolean))];

    for (const patientId of uniquePatientIds) {
      await get().addToQueue(patientId);
    }

    await get().fetchQueue();
  },

  removePatientFromActiveQueue: async (patientId) => {
    if (!patientId) return;

    const { error } = await supabase
      .from('queue')
      .delete()
      .eq('patient_id', patientId)
      .in('status', ['waiting', 'current']);

    if (error) throw error;

    await get().fetchQueue();
  },

  startConsultation: async (queueId) => {
    if (!queueId) return;

    const { error: clearError } = await supabase
      .from('queue')
      .update({ status: 'done' })
      .eq('status', 'current');

    if (clearError) throw clearError;

    const { error: currentError } = await supabase
      .from('queue')
      .update({ status: 'current' })
      .eq('id', queueId)
      .eq('status', 'waiting');

    if (currentError) throw currentError;

    await get().fetchQueue();
  },

  nextPatient: async () => {
    const queue = get().queue;
    if (queue.length === 0) return;

    await get().startConsultation(queue[0].id);
  },

  markNoShow: async (queueId) => {
    if (!queueId) return;

    const { data: queueEntry, error: queueEntryError } = await supabase
      .from('queue')
      .select('patient_id')
      .eq('id', queueId)
      .maybeSingle();

    if (queueEntryError) throw queueEntryError;

    const { error } = await supabase
      .from('queue')
      .update({ status: 'done' })
      .eq('id', queueId);

    if (error) throw error;

    if (queueEntry?.patient_id) {
      const { startIso, endIso } = getTodayRange();

      await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('patient_id', queueEntry.patient_id)
        .gte('date_time', startIso)
        .lt('date_time', endIso)
        .in('status', ['scheduled', 'in-progress']);
    }

    await get().fetchQueue();
  },

  removeFromQueue: async (id) => {
    const { error } = await supabase.from('queue').delete().eq('id', id);
    if (error) throw error;

    await get().fetchQueue();
  },
}));

export default useQueueStore;
