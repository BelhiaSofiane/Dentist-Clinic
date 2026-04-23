import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Clock, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import useQueueStore from '../context/queueStore';
import useAuthStore from '../context/authStore';
import { Badge } from '@/components/ui/badge';

const WaitingRoom = () => {
  const { t } = useTranslation();
  const { currentPatient, queue, fetchQueue, nextPatient, startConsultation } = useQueueStore();
  const { role } = useAuthStore();

  useEffect(() => {
    fetchQueue();

    const queueChannel = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, () => {
        fetchQueue();
      })
      .subscribe();

    const appointmentChannel = supabase
      .channel('appointment_queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(appointmentChannel);
    };
  }, [fetchQueue]);

  const nextPatientInQueue = queue[0] ?? null;
  const upcomingPatients = queue.slice(1);
  const estimatedWaitTime = queue.reduce(
    (total, patient) => total + (patient.avgDurationMinutes ?? 30),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('queue.title')}</h1>
          <p className="text-lg text-gray-600">Dental Clinic</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{t('queue.current')}</h2>
            </div>
            {currentPatient ? (
              <div className="space-y-3">
                <Badge className="bg-green-100 text-green-800">Current Patient</Badge>
                <h3 className="text-3xl font-bold text-gray-900">
                  {currentPatient.patients?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Avg treatment: {currentPatient.avgDurationMinutes ?? 30} min
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500">No patient currently in consultation</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Next Patient</h2>
              </div>
              <div className="flex items-center text-blue-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-lg font-semibold">
                  ~{estimatedWaitTime} min
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {nextPatientInQueue ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {nextPatientInQueue.patients?.name}
                    </h3>
                    <Badge variant="outline">Next Patient</Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>Estimated wait: {nextPatientInQueue.estimatedWaitMinutes ?? 0} min</p>
                    <p>ETA: {nextPatientInQueue.expectedStartAt ? format(new Date(nextPatientInQueue.expectedStartAt), 'p') : '--:--'}</p>
                    <p>Avg treatment: {nextPatientInQueue.avgDurationMinutes ?? 30} min</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No next patient yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 lg:col-span-1">
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Patients</h2>
            </div>
            <div className="space-y-3">
              {upcomingPatients.length > 0 ? (
                upcomingPatients.map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{item.patients?.name}</h3>
                      <Badge variant="secondary">Waiting</Badge>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 space-y-1">
                      <p>ETA: {item.expectedStartAt ? format(new Date(item.expectedStartAt), 'p') : '--:--'}</p>
                      <p>Avg treatment: {item.avgDurationMinutes ?? 30} min</p>
                      <p>Estimated wait: {item.estimatedWaitMinutes ?? 0} min</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No additional patients waiting.</p>
              )}
            </div>
          </div>
        </div>

        {role === 'admin' && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Controls</h3>
            <div className="flex space-x-4">
              <button
                onClick={nextPatient}
                disabled={queue.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('queue.next')}
              </button>
              <button
                onClick={() => startConsultation(queue[0]?.id)}
                disabled={queue.length === 0}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('queue.start')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
