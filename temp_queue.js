  fetchQueue: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('queue')
      .select(
        *,
        patients (name, phone)
      )
      .order('position', { ascending: true });
    if (error) throw error;
    const current = data.find((q) => q.status === 'current');
    const waiting = data.filter((q) => q.status === 'waiting');
    set({ queue: waiting, currentPatient: current, loading: false });
  },
