import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Clock, User, Users } from 'lucide-react';
import useQueueStore from '../context/queueStore';
import useAuthStore from '../context/authStore';

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

  const estimatedWaitTime = queue.length * 30;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('queue.title')}</h1>
          <p className="text-lg text-gray-600">Dental Clinic</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{t('queue.current')}</h2>
            </div>
            {currentPatient ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentPatient.patients?.name}
                </h3>
                <p className="text-lg text-gray-600">
                  {currentPatient.patients?.phone}
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
                <h2 className="text-2xl font-bold text-gray-900">{t('queue.waiting')}</h2>
              </div>
              <div className="flex items-center text-blue-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-lg font-semibold">
                  ~{estimatedWaitTime} min
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {queue.length > 0 ? (
                queue.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.patients?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.patients?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No patients waiting</p>
                </div>
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
