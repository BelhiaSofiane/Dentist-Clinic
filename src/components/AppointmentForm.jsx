import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock3, Lock, Stethoscope, X } from 'lucide-react';
import { format } from 'date-fns';
import useAppointmentStore from '../context/appointmentStore';
import usePatientStore from '../context/patientStore';
import useAuthStore from '../context/authStore';

const TIME_SLOTS = Array.from({ length: 18 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minute = String(totalMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
});

const REASONS = [
  'consultation',
  'cleaning',
  'checkup',
  'filling',
  'extraction',
];

const toDateInput = (value) => format(new Date(value), 'yyyy-MM-dd');
const toTimeInput = (value) => format(new Date(value), 'HH:mm');

const AppointmentForm = ({ appointment, onClose }) => {
  const { t } = useTranslation();
  const { addAppointment, updateAppointment, appointments, fetchAppointments } = useAppointmentStore();
  const { patients } = usePatientStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    patient_id: '',
    duration: 30,
    reason: '',
    status: 'scheduled',
  });
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (!appointment) return;

    setFormData({
      patient_id: appointment.patient_id || '',
      duration: appointment.duration || 30,
      reason: appointment.reason || '',
      status: appointment.status || 'scheduled',
    });
    setSelectedDate(toDateInput(appointment.date_time));
    setSelectedTime(toTimeInput(appointment.date_time));
  }, [appointment]);

  const bookedSlots = useMemo(() => {
    const slots = new Set();

    appointments
      .filter((item) => {
        if (item.status === 'canceled') return false;
        if (appointment?.id && item.id === appointment.id) return false;
        return toDateInput(item.date_time) === selectedDate;
      })
      .forEach((item) => {
        slots.add(toTimeInput(item.date_time));
      });

    return slots;
  }, [appointments, selectedDate, appointment?.id]);

  const quickDates = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEE dd'),
      };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedDate || !selectedTime) {
        throw new Error('Please select both date and time.');
      }

      if (bookedSlots.has(selectedTime)) {
        throw new Error('That time slot is already booked. Please pick another slot.');
      }

      const data = {
        ...formData,
        date_time: `${selectedDate}T${selectedTime}`,
        created_by: user?.id,
      };

      if (appointment) {
        await updateAppointment(appointment.id, data);
      } else {
        await addAppointment(data);
      }

      onClose();
    } catch (saveError) {
      setError(saveError.message || 'Could not save appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-sky-100 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {appointment ? 'Edit Appointment' : 'Create Appointment'}
              </h2>
              <p className="text-sm text-blue-100">Chair schedule and patient queue slot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="patient_id" className="block text-sm font-semibold text-slate-700">
                Patient
              </label>
              <select
                id="patient_id"
                name="patient_id"
                required
                value={formData.patient_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, patient_id: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-semibold text-slate-700">
                Reason
              </label>
              <select
                id="reason"
                name="reason"
                required
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select reason</option>
                {REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason.charAt(0).toUpperCase() + reason.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-slate-700">
                  Duration (min)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min="15"
                  max="120"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
              <div className="flex items-center gap-2 text-cyan-800 font-semibold mb-2">
                <CalendarDays className="w-4 h-4" />
                Select Visit Date
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (bookedSlots.has(selectedTime)) {
                    setSelectedTime('');
                  }
                }}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-cyan-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {quickDates.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setSelectedDate(day.value)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition ${
                      selectedDate === day.value
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-100'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Clock3 className="w-4 h-4" />
                  Choose Time Slot
                </div>
                <div className="text-xs text-slate-500">
                  Locked: {bookedSlots.size}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                {TIME_SLOTS.map((slot) => {
                  const isLocked = bookedSlots.has(slot);
                  const isSelected = selectedTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isLocked}
                      onClick={() => setSelectedTime(slot)}
                      className={`px-3 py-2 text-sm rounded-lg border transition flex items-center justify-center gap-1 ${
                        isLocked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : null}
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
